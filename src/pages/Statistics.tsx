import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import PageLayout from '@/components/layout/PageLayout';
import { useAuthStore } from '@/stores/authStore';
import { useGoalStore } from '@/stores/goalStore';
import { db } from '@/services/db/database';
import { CATEGORIES } from '@/constants/categories';
import { last7Days, last30Days, shortDayName } from '@/utils/dateUtils';

type Range = '7days' | '30days';

interface DayData {
  date: string;
  label: string;
  minutes: number;
}

interface CategoryData {
  id: string;
  name: string;
  icon: string;
  color: string;
  minutes: number;
}

export default function Statistics() {
  const { user } = useAuthStore();
  const { goals } = useGoalStore();
  const [range, setRange] = useState<Range>('7days');
  const [dayData, setDayData] = useState<DayData[]>([]);
  const [catData, setCatData] = useState<CategoryData[]>([]);
  const [totalMinutes, setTotalMinutes] = useState(0);
  const [completionRate, setCompletionRate] = useState(0);
  const [currentStreak, setCurrentStreak] = useState(0);

  useEffect(() => {
    if (user) loadStats();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, range, goals]);

  const loadStats = async () => {
    if (!user) return;
    const dates = range === '7days' ? last7Days() : last30Days();
    const startDate = dates[0];
    const endDate = dates[dates.length - 1];

    const logs = await db.goalLogs
      .where('userId')
      .equals(user.id)
      .filter((l) => l.date >= startDate && l.date <= endDate)
      .toArray();

    // Günlük data
    const dayMap: Record<string, number> = {};
    dates.forEach((d) => (dayMap[d] = 0));

    logs.forEach((log) => {
      const goal = goals.find((g) => g.id === log.goalId);
      if (!goal) return;
      const mins = goal.targetUnit === 'hours' ? log.completedValue * 60 : goal.targetUnit === 'seconds' ? log.completedValue / 60 : log.completedValue;
      dayMap[log.date] = (dayMap[log.date] ?? 0) + mins;
    });

    setDayData(
      dates.map((d) => ({
        date: d,
        label: shortDayName(d),
        minutes: Math.round(dayMap[d] ?? 0),
      }))
    );

    // Toplam
    const total = Object.values(dayMap).reduce((s, m) => s + m, 0);
    setTotalMinutes(Math.round(total));

    // Kategori data
    const catMap: Record<string, number> = {};
    logs.forEach((log) => {
      const goal = goals.find((g) => g.id === log.goalId);
      if (!goal) return;
      const mins = goal.targetUnit === 'hours' ? log.completedValue * 60 : goal.targetUnit === 'seconds' ? log.completedValue / 60 : log.completedValue;
      catMap[goal.categoryId] = (catMap[goal.categoryId] ?? 0) + mins;
    });

    const catArr: CategoryData[] = CATEGORIES.map((cat) => ({
      id: cat.id,
      name: cat.name,
      icon: cat.icon,
      color: cat.color,
      minutes: Math.round(catMap[cat.id] ?? 0),
    })).filter((c) => c.minutes > 0).sort((a, b) => b.minutes - a.minutes);

    setCatData(catArr);

    // Tamamlama oranı
    const dailyGoals = goals.filter((g) => g.isActive && g.period === 'daily');
    if (dailyGoals.length > 0 && dates.length > 0) {
      let completedDays = 0;
      dates.forEach((date) => {
        const dayLogs = logs.filter((l) => l.date === date && l.isCompleted);
        if (dayLogs.length >= dailyGoals.length * 0.5) completedDays++;
      });
      setCompletionRate(Math.round((completedDays / dates.length) * 100));
    }

    // Streak
    const allLogs = await db.goalLogs
      .where('userId').equals(user.id)
      .filter((l) => l.isCompleted)
      .toArray();
    const uniqueDates = [...new Set(allLogs.map((l) => l.date))].sort().reverse();
    let streak = 0;
    const today = new Date().toISOString().slice(0, 10);
    for (let i = 0; i < uniqueDates.length; i++) {
      const exp = new Date(today);
      exp.setDate(exp.getDate() - i);
      if (uniqueDates[i] === exp.toISOString().slice(0, 10)) streak++;
      else break;
    }
    setCurrentStreak(streak);
  };

  const maxMinutes = Math.max(...dayData.map((d) => d.minutes), 1);

  const formatTime = (mins: number) => {
    if (mins >= 60) return `${Math.floor(mins / 60)}s ${mins % 60 > 0 ? mins % 60 + 'dk' : ''}`.trim();
    return `${mins}dk`;
  };

  return (
    <PageLayout title="İstatistikler">
      {/* Range selector */}
      <div className="flex gap-2 mb-5">
        {([['7days', 'Son 7 Gün'], ['30days', 'Son 30 Gün']] as const).map(([val, label]) => (
          <button
            key={val}
            onClick={() => setRange(val)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${
              range === val
                ? 'bg-indigo-600 text-white'
                : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-600'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Özet kartlar */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-3 text-center shadow-sm">
          <p className="text-xl font-bold text-indigo-600">{formatTime(totalMinutes)}</p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">Toplam Süre</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-3 text-center shadow-sm">
          <p className="text-xl font-bold text-green-600">%{completionRate}</p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">Tamamlama</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-3 text-center shadow-sm">
          <p className="text-xl font-bold text-orange-500">🔥{currentStreak}</p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">Gün Serisi</p>
        </div>
      </div>

      {/* Bar Chart */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm mb-5">
        <h3 className="text-sm font-bold text-gray-800 dark:text-gray-100 mb-4">Günlük Aktivite</h3>
        <ResponsiveContainer width="100%" height={160}>
          <BarChart data={dayData} margin={{ top: 0, right: 0, left: -30, bottom: 0 }}>
            <XAxis
              dataKey="label"
              tick={{ fontSize: 11, fill: '#9ca3af' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 10, fill: '#9ca3af' }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v: number) => v >= 60 ? `${Math.floor(v / 60)}s` : `${v}dk`}
            />
            <Tooltip
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              formatter={(value: any) => [formatTime(Number(value ?? 0)), 'Süre']}
              contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
            />
            <Bar dataKey="minutes" radius={[6, 6, 0, 0]} maxBarSize={36}>
              {dayData.map((entry, index) => (
                <Cell
                  key={index}
                  fill={entry.minutes >= maxMinutes * 0.7 ? '#6366f1' : '#e0e7ff'}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Kategori dağılımı */}
      {catData.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm mb-5">
          <h3 className="text-sm font-bold text-gray-800 dark:text-gray-100 mb-4">Kategoriye Göre</h3>
          <div className="space-y-3">
            {catData.map((cat) => {
              const pct = Math.round((cat.minutes / totalMinutes) * 100);
              return (
                <div key={cat.id}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span>{cat.icon}</span>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{cat.name}</span>
                    </div>
                    <span className="text-sm text-gray-500 dark:text-gray-400">{formatTime(cat.minutes)}</span>
                  </div>
                  <div className="bg-gray-100 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="h-2 rounded-full transition-all"
                      style={{ width: `${pct}%`, backgroundColor: cat.color }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {catData.length === 0 && totalMinutes === 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-10 text-center shadow-sm">
          <div className="text-4xl mb-3">📊</div>
          <p className="text-gray-500 dark:text-gray-400 font-medium">Henüz veri yok</p>
          <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">Hedeflerini tamamlamaya başla!</p>
        </div>
      )}
    </PageLayout>
  );
}
