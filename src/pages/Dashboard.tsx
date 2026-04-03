import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Plus, Flame, RotateCcw } from 'lucide-react';
import { useGoalStore } from '@/stores/goalStore';
import { useAuthStore } from '@/stores/authStore';
import { useBadgeStore } from '@/stores/badgeStore';
import { getCategoryById } from '@/constants/categories';
import { todayDisplay, today, getWeekRange, getMonthRange, getYearRange } from '@/utils/dateUtils';
import { calcPercentage, formatDuration } from '@/utils/progressUtils';
import type { Goal, GoalPeriod, RepeatType } from '@/types';
import PageLayout from '@/components/layout/PageLayout';
import AppLogo from '@/components/layout/AppLogo';
import GoalForm from '@/components/goals/GoalForm';
import BadgeEarnedModal from '@/components/badges/BadgeEarnedModal';
import DurationModal from '@/components/goals/DurationModal';
import { db } from '@/services/db/database';

const PERIOD_SHORT: Record<GoalPeriod, string> = {
  daily: 'G', weekly: 'H', monthly: 'A', yearly: 'Y',
};
const PERIOD_LABELS: Record<GoalPeriod, string> = {
  daily: 'Günlük', weekly: 'Haftalık', monthly: 'Aylık', yearly: 'Yıllık',
};

function getPeriodRange(period: GoalPeriod) {
  if (period === 'weekly') return getWeekRange();
  if (period === 'monthly') return getMonthRange();
  return getYearRange();
}

// Günlük hedef bugün gösterilmeli mi?
function isGoalActiveToday(goal: Goal): boolean {
  const todayStr = today();

  if (todayStr < goal.startDate) return false;
  if (goal.endDate && todayStr > goal.endDate) return false;

  const repeatType: RepeatType = goal.repeatType ?? 'none';
  if (repeatType === 'none') return goal.startDate === todayStr;
  if (repeatType === 'daily') return true;

  const dayOfWeek = new Date(todayStr + 'T00:00:00').getDay(); // 0=Pazar
  if (repeatType === 'weekdays') return dayOfWeek >= 1 && dayOfWeek <= 5;
  if (repeatType === 'custom') return (goal.repeatDays ?? []).includes(dayOfWeek);

  return false;
}

export default function Dashboard() {
  const { user } = useAuthStore();
  const { goals, todayLogs, loadGoals, loadTodayLogs, completeGoal, uncompleteGoal } = useGoalStore();
  const { newlyEarned, clearNewlyEarned, checkAndAwardBadges } = useBadgeStore();

  const [showForm, setShowForm] = useState(false);
  const [durationGoal, setDurationGoal] = useState<Goal | null>(null);
  const [streak, setStreak] = useState(0);
  const [periodTotals, setPeriodTotals] = useState<Record<string, number>>({});

  useEffect(() => {
    if (user) {
      loadGoals(user.id);
      loadTodayLogs(user.id);
      calcStreak(user.id);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const loadPeriodTotals = useCallback(async (activeGoals: Goal[]) => {
    const ltGoals = activeGoals.filter((g) => g.period !== 'daily');
    const totals: Record<string, number> = {};
    await Promise.all(
      ltGoals.map(async (goal) => {
        const range = getPeriodRange(goal.period);
        const logs = await db.goalLogs
          .where('goalId').equals(goal.id)
          .filter((l) => l.date >= range.start && l.date <= range.end)
          .toArray();
        const total = logs.reduce((sum, l) => {
          if (goal.targetUnit === 'hours') return sum + l.completedValue;
          if (goal.targetUnit === 'minutes') return sum + l.completedValue / 60;
          return sum + l.completedValue / 3600; // seconds → hours
        }, 0);
        totals[goal.id] = Math.round(total * 10) / 10;
      })
    );
    setPeriodTotals(totals);
  }, []);

  useEffect(() => {
    const ag = goals.filter((g) => g.isActive && g.userId === user?.id);
    if (ag.length > 0) loadPeriodTotals(ag);
  }, [goals, todayLogs, user?.id, loadPeriodTotals]);

  const calcStreak = async (userId: string) => {
    const logs = await db.goalLogs.where('userId').equals(userId)
      .filter((l) => l.completedValue > 0).toArray();
    const dates = [...new Set(logs.map((l) => l.date))].sort().reverse();
    let s = 0;
    const todayStr = today();
    for (let i = 0; i < dates.length; i++) {
      const exp = new Date(todayStr);
      exp.setDate(exp.getDate() - i);
      if (dates[i] === exp.toISOString().slice(0, 10)) s++;
      else break;
    }
    setStreak(s);
  };

  const activeGoals = goals.filter((g) => g.isActive && g.userId === user?.id);
  // Günlük hedefleri sadece planlandıkları günde göster
  const dailyGoals = activeGoals.filter((g) => g.period === 'daily' && isGoalActiveToday(g));
  const longTermGoals = activeGoals.filter((g) => g.period !== 'daily');

  const completedDailyCount = dailyGoals.filter((g) =>
    todayLogs.some((l) => l.goalId === g.id && l.isCompleted)
  ).length;
  const dailyPct = dailyGoals.length > 0
    ? Math.round((completedDailyCount / dailyGoals.length) * 100) : 0;

  // Uzun vadeli hedeflerin ortalama % si
  const ltAvgPct = longTermGoals.length > 0
    ? Math.round(
        longTermGoals.reduce((sum, g) => {
          const pct = calcPercentage(periodTotals[g.id] ?? 0, g.targetValue);
          return sum + pct;
        }, 0) / longTermGoals.length
      )
    : 0;

  const ltActedToday = longTermGoals.filter((g) =>
    todayLogs.some((l) => l.goalId === g.id && l.completedValue > 0)
  ).length;

  const getLogForGoal = (goalId: string) => todayLogs.find((l) => l.goalId === goalId);

  const handleDailyTick = (goal: Goal) => {
    const log = getLogForGoal(goal.id);
    if (log?.isCompleted) { if (user) uncompleteGoal(goal.id, user.id); }
    else setDurationGoal(goal);
  };

  const handleDurationSubmit = async (value: number) => {
    if (!user || !durationGoal) return;
    await completeGoal(durationGoal.id, user.id, value);
    setDurationGoal(null);
    await loadTodayLogs(user.id);
    const ag = goals.filter((g) => g.isActive && g.userId === user.id);
    await loadPeriodTotals(ag);
    await checkAndAwardBadges(user.id);
    calcStreak(user.id);
  };

  const handleFormClose = async () => {
    setShowForm(false);
    if (user) { await loadGoals(user.id); await loadTodayLogs(user.id); }
  };

  return (
    <PageLayout noPadding>
      <div className="px-3 pt-4">

        {/* ── Header ──────────────────────────────────────────── */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <AppLogo size={36} />
            <div>
              <p className="text-xs text-gray-400 dark:text-gray-500 font-medium">{todayDisplay()}</p>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white mt-0.5">
                Merhaba, {user?.name?.split(' ')[0]} 👋
              </h1>
            </div>
          </div>
          {streak > 0 && (
            <div className="flex items-center gap-1 bg-orange-50 border border-orange-200 px-2.5 py-1 rounded-full">
              <Flame size={14} className="text-orange-500" />
              <span className="text-xs font-bold text-orange-600">{streak} gün</span>
            </div>
          )}
        </div>

        {/* ── İki özet kart yan yana ──────────────────────────── */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          {/* Günlük */}
          <div className="bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-2xl p-4 text-white shadow-md">
            <p className="text-indigo-200 text-xs font-medium mb-1">Günlük</p>
            <p className="text-3xl font-bold leading-none">%{dailyPct}</p>
            <div className="bg-white/20 rounded-full h-1.5 mt-2 mb-1">
              <motion.div className="bg-white rounded-full h-1.5"
                initial={{ width: 0 }} animate={{ width: `${dailyPct}%` }}
                transition={{ duration: 0.6, ease: 'easeOut' }} />
            </div>
            <p className="text-indigo-200 text-xs">{completedDailyCount}/{dailyGoals.length} tamamlandı</p>
          </div>

          {/* Uzun vade */}
          <div className="bg-gradient-to-br from-purple-500 to-purple-700 rounded-2xl p-4 text-white shadow-md">
            <p className="text-purple-200 text-xs font-medium mb-1">Uzun Vade</p>
            <p className="text-3xl font-bold leading-none">%{ltAvgPct}</p>
            <div className="bg-white/20 rounded-full h-1.5 mt-2 mb-1">
              <motion.div className="bg-white rounded-full h-1.5"
                initial={{ width: 0 }} animate={{ width: `${ltAvgPct}%` }}
                transition={{ duration: 0.6, ease: 'easeOut', delay: 0.1 }} />
            </div>
            <p className="text-purple-200 text-xs">
              {ltActedToday > 0 ? `${ltActedToday} hedef aktif bugün` : `${longTermGoals.length} hedef`}
            </p>
          </div>
        </div>

        {/* ── Günlük Hedefler ─────────────────────────────────── */}
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm font-bold text-gray-800 dark:text-gray-100">Günlük Hedeflerim</h2>
          <button onClick={() => setShowForm(true)}
            className="flex items-center gap-0.5 text-indigo-600 text-xs font-medium hover:text-indigo-700 transition">
            <Plus size={14} /> Ekle
          </button>
        </div>

        {dailyGoals.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 text-center shadow-sm mb-4">
            <div className="text-2xl mb-1">🎯</div>
            <p className="text-gray-400 dark:text-gray-500 text-xs">Günlük hedef yok</p>
            <button onClick={() => setShowForm(true)}
              className="mt-2 text-indigo-600 dark:text-indigo-400 text-xs font-semibold hover:underline">Ekle</button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2 mb-5">
            {dailyGoals.map((goal) => {
              const cat = getCategoryById(goal.categoryId);
              const log = getLogForGoal(goal.id);
              const isCompleted = log?.isCompleted ?? false;
              const todayPct = log ? calcPercentage(log.completedValue, goal.targetValue) : 0;
              const color = cat?.color ?? '#6366f1';

              return (
                <motion.div key={goal.id} layout
                  className={`bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-3 flex flex-col gap-2 cursor-pointer ${
                    isCompleted ? 'opacity-75' : ''
                  }`}
                  onClick={() => handleDailyTick(goal)}>

                  {/* Üst satır: ikon + checkbox */}
                  <div className="flex items-center justify-between">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center text-base"
                      style={{ backgroundColor: color + '20' }}>
                      {cat?.icon}
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDailyTick(goal); }}
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition ${
                        isCompleted ? 'border-transparent' : 'border-gray-200'
                      }`}
                      style={isCompleted ? { backgroundColor: color } : {}}>
                      <AnimatePresence>
                        {isCompleted ? (
                          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                            <Check size={11} strokeWidth={3} className="text-white" />
                          </motion.div>
                        ) : (
                          <Check size={10} className="text-gray-200" strokeWidth={2} />
                        )}
                      </AnimatePresence>
                    </button>
                  </div>

                  {/* Başlık */}
                  <p className={`text-xs font-semibold leading-tight ${
                    isCompleted ? 'line-through text-gray-400 dark:text-gray-600' : 'text-gray-900 dark:text-white'
                  }`} style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {goal.title}
                  </p>

                  {/* Progress */}
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs text-gray-400 dark:text-gray-500">
                        {formatDuration(goal.targetValue, goal.targetUnit)}
                      </span>
                      <span className="text-xs font-bold" style={{ color }}>
                        %{todayPct}
                      </span>
                    </div>
                    <div className="bg-gray-100 dark:bg-gray-700 rounded-full h-1.5">
                      <div className="h-1.5 rounded-full transition-all"
                        style={{ width: `${todayPct}%`, backgroundColor: color }} />
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* ── Uzun Vadeli Hedefler ──────────────────────────── */}
        {longTermGoals.length > 0 && (
          <>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-sm font-bold text-gray-800 dark:text-gray-100">Uzun Vadeli Hedeflerim</h2>
              <span className="text-xs font-bold text-purple-600">Ort. %{ltAvgPct}</span>
            </div>
            <div className="grid grid-cols-2 gap-2 mb-5">
              {longTermGoals.map((goal) => {
                const cat = getCategoryById(goal.categoryId);
                const log = getLogForGoal(goal.id);
                const hasActivityToday = (log?.completedValue ?? 0) > 0;
                const color = cat?.color ?? '#6366f1';
                const periodTotal = periodTotals[goal.id] ?? 0;
                const periodPct = calcPercentage(periodTotal, goal.targetValue);
                const isFullyComplete = periodPct >= 100;

                return (
                  <motion.div key={goal.id} layout
                    className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm overflow-hidden">
                    <div className="p-3 flex flex-col gap-2">

                      {/* Üst satır: ikon + period badge + aksiyon */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <div className="w-7 h-7 rounded-lg flex items-center justify-center text-sm"
                            style={{ backgroundColor: color + '20' }}>
                            {cat?.icon}
                          </div>
                          <span className="text-xs font-bold px-1.5 py-0.5 rounded-full text-white"
                            style={{ backgroundColor: color }}>
                            {PERIOD_SHORT[goal.period]}
                          </span>
                        </div>

                        {/* Aksiyon */}
                        {isFullyComplete ? (
                          <div className="w-6 h-6 rounded-full flex items-center justify-center"
                            style={{ backgroundColor: color }}>
                            <Check size={12} strokeWidth={3} className="text-white" />
                          </div>
                        ) : hasActivityToday ? (
                          <div className="flex items-center gap-1">
                            <button onClick={() => setDurationGoal(goal)}
                              className="w-6 h-6 rounded-full border-2 flex items-center justify-center transition"
                              style={{ borderColor: color, color }}>
                              <Plus size={13} strokeWidth={2.5} />
                            </button>
                            <button onClick={() => user && uncompleteGoal(goal.id, user.id)}
                              className="text-gray-300 hover:text-gray-500 transition">
                              <RotateCcw size={10} />
                            </button>
                          </div>
                        ) : (
                          <button onClick={() => setDurationGoal(goal)}
                            className="w-6 h-6 rounded-full border-2 border-gray-200 hover:border-indigo-400 flex items-center justify-center transition text-gray-300 hover:text-indigo-500">
                            <Plus size={13} strokeWidth={2} />
                          </button>
                        )}
                      </div>

                      {/* Başlık */}
                      <p className="text-xs font-semibold text-gray-900 dark:text-white leading-tight"
                        style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {goal.title}
                      </p>

                      {/* % + progress */}
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-xs text-gray-400 dark:text-gray-500">
                            {periodTotal}/{goal.targetValue}s
                          </span>
                          <span className="text-xs font-bold" style={{ color }}>
                            %{periodPct}
                          </span>
                        </div>
                        <div className="bg-gray-100 dark:bg-gray-700 rounded-full h-1.5">
                          <motion.div className="h-1.5 rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${periodPct}%` }}
                            transition={{ duration: 0.5 }}
                            style={{ backgroundColor: color }} />
                        </div>
                        {hasActivityToday && (
                          <p className="text-xs mt-1 font-medium" style={{ color }}>
                            +{formatDuration(log!.completedValue, goal.targetUnit)} bugün
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Tamamlandı banner */}
                    {isFullyComplete && (
                      <div className="px-3 py-1 text-xs font-semibold text-white text-center"
                        style={{ backgroundColor: color }}>
                        🎉 {PERIOD_LABELS[goal.period]} tamamlandı!
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </>
        )}

        {activeGoals.length === 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-10 text-center shadow-sm">
            <div className="text-4xl mb-3">🎯</div>
            <p className="text-gray-500 dark:text-gray-400 font-medium">Henüz hedef eklenmedi</p>
            <button onClick={() => setShowForm(true)}
              className="mt-3 text-indigo-600 dark:text-indigo-400 font-semibold hover:underline text-sm">
              İlk hedefini ekle
            </button>
          </div>
        )}

      </div>

      {showForm && <GoalForm onClose={handleFormClose} />}
      {durationGoal && (
        <DurationModal goal={durationGoal} onClose={() => setDurationGoal(null)}
          onSubmit={handleDurationSubmit} />
      )}
      {newlyEarned.length > 0 && (
        <BadgeEarnedModal badges={newlyEarned} onClose={clearNewlyEarned} />
      )}
    </PageLayout>
  );
}
