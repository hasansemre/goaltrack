import { db } from './database';
import type { Goal, GoalLog } from '@/types';
import { format } from 'date-fns';

// ─── Goals ────────────────────────────────────────────────────────────────

export async function getGoalsByUser(userId: string): Promise<Goal[]> {
  return db.goals.where('userId').equals(userId).toArray();
}

export async function getActiveGoalsByUser(userId: string): Promise<Goal[]> {
  return db.goals
    .where('userId')
    .equals(userId)
    .filter((g) => g.isActive)
    .toArray();
}

export async function saveGoal(goal: Goal): Promise<void> {
  await db.goals.put(goal);
}

export async function deleteGoal(id: string): Promise<void> {
  await db.goals.delete(id);
  // Also delete related logs
  const logs = await db.goalLogs.where('goalId').equals(id).toArray();
  await db.goalLogs.bulkDelete(logs.map((l) => l.id));
}

export async function getGoalById(id: string): Promise<Goal | undefined> {
  return db.goals.get(id);
}

// ─── Goal Logs ────────────────────────────────────────────────────────────

export async function getLogsByDate(userId: string, date: string): Promise<GoalLog[]> {
  return db.goalLogs
    .where('userId')
    .equals(userId)
    .filter((l) => l.date === date)
    .toArray();
}

export async function getLogsByGoal(goalId: string): Promise<GoalLog[]> {
  return db.goalLogs.where('goalId').equals(goalId).toArray();
}

export async function getLogByGoalAndDate(
  goalId: string,
  date: string
): Promise<GoalLog | undefined> {
  return db.goalLogs
    .where('goalId')
    .equals(goalId)
    .filter((l) => l.date === date)
    .first();
}

export async function saveGoalLog(log: GoalLog): Promise<void> {
  await db.goalLogs.put(log);
}

export async function getLogsByDateRange(
  userId: string,
  startDate: string,
  endDate: string
): Promise<GoalLog[]> {
  return db.goalLogs
    .where('userId')
    .equals(userId)
    .filter((l) => l.date >= startDate && l.date <= endDate)
    .toArray();
}

// ─── Today's date helper ─────────────────────────────────────────────────

export const today = () => format(new Date(), 'yyyy-MM-dd');
