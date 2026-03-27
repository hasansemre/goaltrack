import { create } from 'zustand';
import type { UserBadge, Badge } from '@/types';
import { BADGES } from '@/constants/badges';
import { db } from '@/services/db/database';
import { generateId } from '@/utils/idUtils';
import { format } from 'date-fns';

interface BadgeStore {
  userBadges: UserBadge[];
  newlyEarned: Badge[];
  loadUserBadges: (userId: string) => Promise<void>;
  checkAndAwardBadges: (userId: string) => Promise<Badge[]>;
  clearNewlyEarned: () => void;
}

export const useBadgeStore = create<BadgeStore>((set, get) => ({
  userBadges: [],
  newlyEarned: [],

  loadUserBadges: async (userId) => {
    const badges = await db.userBadges.where('userId').equals(userId).toArray();
    set({ userBadges: badges });
  },

  checkAndAwardBadges: async (userId) => {
    const { userBadges } = get();
    const earnedIds = new Set(userBadges.map((b) => b.badgeId));
    const newBadges: Badge[] = [];

    const logs = await db.goalLogs.where('userId').equals(userId).toArray();
    const goals = await db.goals.where('userId').equals(userId).toArray();

    for (const badge of BADGES) {
      if (earnedIds.has(badge.id)) continue;

      let conditionMet = false;
      const { condition } = badge;

      // Herhangi bir aksiyon (completedValue > 0) katkı sayılır —
      // bu sayede uzun vadeli hedeflerin partial logları da rozete katkı sağlar
      const hasActivity = (l: { completedValue: number }) => l.completedValue > 0;

      if (condition.type === 'total_days') {
        const categoryGoals = condition.categoryId
          ? goals.filter((g) => g.categoryId === condition.categoryId)
          : goals;
        const categoryGoalIds = new Set(categoryGoals.map((g) => g.id));
        const activeLogs = logs.filter(
          (l) => categoryGoalIds.has(l.goalId) && hasActivity(l)
        );
        const uniqueDays = new Set(activeLogs.map((l) => l.date)).size;
        conditionMet = uniqueDays >= condition.value;
      } else if (condition.type === 'total_hours') {
        const categoryGoals = condition.categoryId
          ? goals.filter((g) => g.categoryId === condition.categoryId)
          : goals;
        const categoryGoalIds = new Set(categoryGoals.map((g) => g.id));
        // Tüm loglar (partial dahil) saate çevrilerek toplanır
        const categoryLogs = logs.filter((l) => categoryGoalIds.has(l.goalId) && hasActivity(l));
        const totalMinutes = categoryLogs.reduce((sum, l) => {
          const goal = goals.find((g) => g.id === l.goalId);
          const multiplier = goal?.targetUnit === 'hours' ? 60 : goal?.targetUnit === 'seconds' ? 1 / 60 : 1;
          return sum + l.completedValue * multiplier;
        }, 0);
        conditionMet = totalMinutes / 60 >= condition.value;
      } else if (condition.type === 'streak') {
        const categoryGoals = condition.categoryId
          ? goals.filter((g) => g.categoryId === condition.categoryId)
          : goals;
        const categoryGoalIds = new Set(categoryGoals.map((g) => g.id));
        // Herhangi bir aksiyon olan günler seri sayılır
        const completedDates = [
          ...new Set(
            logs
              .filter((l) => categoryGoalIds.has(l.goalId) && hasActivity(l))
              .map((l) => l.date)
          ),
        ].sort();

        let streak = 0;
        let maxStreak = 0;
        for (let i = 0; i < completedDates.length; i++) {
          if (i === 0) {
            streak = 1;
          } else {
            const prev = new Date(completedDates[i - 1]);
            const curr = new Date(completedDates[i]);
            const diff = (curr.getTime() - prev.getTime()) / 86400000;
            streak = diff === 1 ? streak + 1 : 1;
          }
          maxStreak = Math.max(maxStreak, streak);
        }
        conditionMet = maxStreak >= condition.value;
      } else if (condition.type === 'total_categories_used') {
        // Kaç farklı kategoride aktivite yapıldı?
        const activeLogs = logs.filter(hasActivity);
        const usedGoalIds = new Set(activeLogs.map((l) => l.goalId));
        const usedCategories = new Set(
          goals.filter((g) => usedGoalIds.has(g.id)).map((g) => g.categoryId)
        );
        conditionMet = usedCategories.size >= condition.value;
      }

      if (conditionMet) {
        const userBadge: UserBadge = {
          id: generateId(),
          userId,
          badgeId: badge.id,
          earnedAt: format(new Date(), "yyyy-MM-dd'T'HH:mm:ss"),
          localVersion: 1,
        };
        await db.userBadges.put(userBadge);
        newBadges.push(badge);
        earnedIds.add(badge.id);
      }
    }

    if (newBadges.length > 0) {
      set((state) => ({
        userBadges: [
          ...state.userBadges,
          ...newBadges.map((b) => ({
            id: generateId(),
            userId,
            badgeId: b.id,
            earnedAt: format(new Date(), "yyyy-MM-dd'T'HH:mm:ss"),
            localVersion: 1,
          })),
        ],
        newlyEarned: newBadges,
      }));
    }

    return newBadges;
  },

  clearNewlyEarned: () => set({ newlyEarned: [] }),
}));
