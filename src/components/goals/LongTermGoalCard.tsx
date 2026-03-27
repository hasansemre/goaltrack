import { useEffect, useState } from 'react';
import type { Goal, GoalPeriod } from '@/types';
import { getCategoryById } from '@/constants/categories';
import { db } from '@/services/db/database';
import { calcPercentage } from '@/utils/progressUtils';
import { getWeekRange, getMonthRange, getYearRange } from '@/utils/dateUtils';

interface Props {
  goal: Goal;
  userId: string;
}

const PERIOD_LABELS: Record<GoalPeriod, string> = {
  daily: 'Günlük',
  weekly: 'Haftalık',
  monthly: 'Aylık',
  yearly: 'Yıllık',
};

export default function LongTermGoalCard({ goal, userId }: Props) {
  const cat = getCategoryById(goal.categoryId);
  const [completed, setCompleted] = useState(0);

  useEffect(() => {
    loadProgress();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [goal.id]);

  const loadProgress = async () => {
    let range: { start: string; end: string };
    if (goal.period === 'weekly') range = getWeekRange();
    else if (goal.period === 'monthly') range = getMonthRange();
    else range = getYearRange();

    const logs = await db.goalLogs
      .where('userId')
      .equals(userId)
      .filter(
        (l) =>
          l.goalId === goal.id &&
          l.date >= range.start &&
          l.date <= range.end
      )
      .toArray();

    const totalHours = logs.reduce((sum, l) => {
      const val = goal.targetUnit === 'minutes' ? l.completedValue / 60 : l.completedValue;
      return sum + val;
    }, 0);

    setCompleted(Math.round(totalHours * 10) / 10);
  };

  const pct = calcPercentage(completed, goal.targetValue);

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span
            className="w-8 h-8 rounded-lg flex items-center justify-center text-base"
            style={{ backgroundColor: (cat?.color ?? '#6366f1') + '20' }}
          >
            {cat?.icon}
          </span>
          <div>
            <p className="text-sm font-semibold text-gray-900">{goal.title}</p>
            <p className="text-xs text-gray-400">{PERIOD_LABELS[goal.period]}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm font-bold" style={{ color: cat?.color ?? '#6366f1' }}>
            %{pct}
          </p>
          <p className="text-xs text-gray-400">
            {completed}/{goal.targetValue}s
          </p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="bg-gray-100 rounded-full h-2">
        <div
          className="h-2 rounded-full transition-all duration-500"
          style={{
            width: `${pct}%`,
            backgroundColor: cat?.color ?? '#6366f1',
          }}
        />
      </div>
    </div>
  );
}
