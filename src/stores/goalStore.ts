import { create } from 'zustand';
import type { Goal, GoalLog } from '@/types';
import { db } from '@/services/db/database';
import { today, getWeekRange, getMonthRange, getYearRange } from '@/utils/dateUtils';
import { generateId } from '@/utils/idUtils';
import { format } from 'date-fns';

interface GoalStore {
  goals: Goal[];
  todayLogs: GoalLog[];
  isLoading: boolean;

  loadGoals: (userId: string) => Promise<void>;
  loadTodayLogs: (userId: string) => Promise<void>;
  addGoal: (goal: Omit<Goal, 'id' | 'createdAt' | 'updatedAt' | 'localVersion'>) => Promise<void>;
  updateGoal: (id: string, updates: Partial<Goal>) => Promise<void>;
  deleteGoal: (id: string) => Promise<void>;
  toggleGoalActive: (id: string) => Promise<void>;

  completeGoal: (goalId: string, userId: string, completedValue: number) => Promise<void>;
  uncompleteGoal: (goalId: string, userId: string) => Promise<void>;
  updateLog: (logId: string, completedValue: number) => Promise<void>;

  // Period toplam (weekly/monthly/yearly hedefler için)
  getPeriodTotal: (goalId: string) => Promise<number>;
}

const now = () => format(new Date(), "yyyy-MM-dd'T'HH:mm:ss");

/** Dönem aralığını döndürür */
function getPeriodRange(period: Goal['period']): { start: string; end: string } {
  if (period === 'weekly') return getWeekRange();
  if (period === 'monthly') return getMonthRange();
  return getYearRange();
}

/** Logların toplam değerini birim dönüşümü yaparak toplar (her zaman saate çevirir) */
function sumLogsInHours(logs: GoalLog[], goal: Goal): number {
  return logs.reduce((sum, l) => {
    let val: number;
    if (goal.targetUnit === 'hours') val = l.completedValue;
    else if (goal.targetUnit === 'minutes') val = l.completedValue / 60;
    else val = l.completedValue / 3600; // seconds → hours
    return sum + val;
  }, 0);
}

export const useGoalStore = create<GoalStore>((set, get) => ({
  goals: [],
  todayLogs: [],
  isLoading: false,

  loadGoals: async (userId) => {
    set({ isLoading: true });
    const goals = await db.goals.where('userId').equals(userId).toArray();
    set({ goals, isLoading: false });
  },

  loadTodayLogs: async (userId) => {
    const date = today();
    const logs = await db.goalLogs
      .where('userId')
      .equals(userId)
      .filter((l) => l.date === date)
      .toArray();
    set({ todayLogs: logs });
  },

  addGoal: async (goalData) => {
    const goal: Goal = {
      ...goalData,
      id: generateId(),
      createdAt: now(),
      updatedAt: now(),
      localVersion: 1,
    };
    await db.goals.put(goal);
    set((state) => ({ goals: [...state.goals, goal] }));
  },

  updateGoal: async (id, updates) => {
    await db.goals.update(id, { ...updates, updatedAt: now(), localVersion: Date.now() });
    set((state) => ({
      goals: state.goals.map((g) =>
        g.id === id ? { ...g, ...updates, updatedAt: now() } : g
      ),
    }));
  },

  deleteGoal: async (id) => {
    await db.goals.delete(id);
    const logs = await db.goalLogs.where('goalId').equals(id).toArray();
    await db.goalLogs.bulkDelete(logs.map((l) => l.id));
    set((state) => ({
      goals: state.goals.filter((g) => g.id !== id),
      todayLogs: state.todayLogs.filter((l) => l.goalId !== id),
    }));
  },

  toggleGoalActive: async (id) => {
    const goal = get().goals.find((g) => g.id === id);
    if (!goal) return;
    await get().updateGoal(id, { isActive: !goal.isActive });
  },

  completeGoal: async (goalId, userId, completedValue) => {
    const date = today();
    const goal = get().goals.find((g) => g.id === goalId);
    if (!goal) return;

    const existing = await db.goalLogs
      .where('goalId')
      .equals(goalId)
      .filter((l) => l.date === date)
      .first();

    // Günlük hedeflerde: bugünün değeri target'a ulaştı mı?
    // Uzun vadeli hedeflerde: dönem toplamı target'a ulaştı mı?
    let isCompleted: boolean;
    if (goal.period === 'daily') {
      isCompleted = completedValue >= goal.targetValue;
    } else {
      // Önceki dönem loglarını al (bugün hariç)
      const range = getPeriodRange(goal.period);
      const previousLogs = await db.goalLogs
        .where('goalId')
        .equals(goalId)
        .filter((l) => l.date >= range.start && l.date <= range.end && l.date !== date)
        .toArray();
      const prevTotal = sumLogsInHours(previousLogs, goal);
      let todayVal: number;
      if (goal.targetUnit === 'hours') todayVal = completedValue;
      else if (goal.targetUnit === 'minutes') todayVal = completedValue / 60;
      else todayVal = completedValue / 3600;
      const periodTotal = prevTotal + todayVal;
      isCompleted = periodTotal >= goal.targetValue;
    }

    if (existing) {
      const updated: GoalLog = {
        ...existing,
        completedValue,
        isCompleted,
        updatedAt: now(),
        localVersion: Date.now(),
      };
      await db.goalLogs.put(updated);
      set((state) => ({
        todayLogs: state.todayLogs.map((l) => (l.id === existing.id ? updated : l)),
      }));
    } else {
      const log: GoalLog = {
        id: generateId(),
        goalId,
        userId,
        date,
        completedValue,
        isCompleted,
        createdAt: now(),
        updatedAt: now(),
        localVersion: 1,
      };
      await db.goalLogs.put(log);
      set((state) => ({ todayLogs: [...state.todayLogs, log] }));
    }
  },

  uncompleteGoal: async (goalId, _userId) => {
    const date = today();
    const existing = await db.goalLogs
      .where('goalId')
      .equals(goalId)
      .filter((l) => l.date === date)
      .first();
    if (!existing) return;
    await db.goalLogs.delete(existing.id);
    set((state) => ({
      todayLogs: state.todayLogs.filter((l) => l.goalId !== goalId),
    }));
  },

  updateLog: async (logId, completedValue) => {
    const log = get().todayLogs.find((l) => l.id === logId);
    if (!log) return;
    const goal = get().goals.find((g) => g.id === log.goalId);
    if (!goal) return;

    let isCompleted: boolean;
    if (goal.period === 'daily') {
      isCompleted = completedValue >= goal.targetValue;
    } else {
      const range = getPeriodRange(goal.period);
      const date = today();
      const previousLogs = await db.goalLogs
        .where('goalId')
        .equals(log.goalId)
        .filter((l) => l.date >= range.start && l.date <= range.end && l.date !== date)
        .toArray();
      const prevTotal = sumLogsInHours(previousLogs, goal);
      let todayVal2: number;
      if (goal.targetUnit === 'hours') todayVal2 = completedValue;
      else if (goal.targetUnit === 'minutes') todayVal2 = completedValue / 60;
      else todayVal2 = completedValue / 3600;
      isCompleted = prevTotal + todayVal2 >= goal.targetValue;
    }

    const updated: GoalLog = {
      ...log,
      completedValue,
      isCompleted,
      updatedAt: now(),
      localVersion: Date.now(),
    };
    await db.goalLogs.put(updated);
    set((state) => ({
      todayLogs: state.todayLogs.map((l) => (l.id === logId ? updated : l)),
    }));
  },

  getPeriodTotal: async (goalId) => {
    const goal = get().goals.find((g) => g.id === goalId);
    if (!goal || goal.period === 'daily') return 0;
    const range = getPeriodRange(goal.period);
    const logs = await db.goalLogs
      .where('goalId')
      .equals(goalId)
      .filter((l) => l.date >= range.start && l.date <= range.end)
      .toArray();
    return Math.round(sumLogsInHours(logs, goal) * 10) / 10;
  },
}));
