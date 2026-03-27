import type { Goal, GoalLog } from '@/types';

export function minutesToHours(minutes: number): number {
  return Math.round((minutes / 60) * 10) / 10;
}

export function normalizeToMinutes(value: number, unit: 'minutes' | 'hours' | 'seconds'): number {
  if (unit === 'hours') return value * 60;
  if (unit === 'seconds') return value / 60;
  return value;
}

export function calcCompleted(goal: Goal, logs: GoalLog[]): number {
  const totalMinutes = logs
    .filter((l) => l.isCompleted || l.completedValue > 0)
    .reduce((sum, l) => sum + normalizeToMinutes(l.completedValue, goal.targetUnit), 0);

  if (goal.targetUnit === 'hours') return minutesToHours(totalMinutes);
  if (goal.targetUnit === 'seconds') return totalMinutes * 60;
  return totalMinutes;
}

export function calcPercentage(completed: number, target: number): number {
  if (target === 0) return 0;
  return Math.min(100, Math.round((completed / target) * 100));
}

/**
 * Format duration: "45 dk", "1.5 saat", "30 sn"
 */
export function formatDuration(value: number, unit: 'minutes' | 'hours' | 'seconds'): string {
  if (unit === 'seconds') {
    if (value >= 60) {
      const m = Math.floor(value / 60);
      const s = value % 60;
      return s > 0 ? `${m}dk ${s}sn` : `${m} dk`;
    }
    return `${value} sn`;
  }
  if (unit === 'minutes') {
    if (value >= 60) {
      const h = Math.floor(value / 60);
      const m = value % 60;
      return m > 0 ? `${h}s ${m}dk` : `${h} saat`;
    }
    return `${value} dk`;
  }
  return `${value} saat`;
}
