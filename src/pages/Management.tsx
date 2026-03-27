import { useState } from 'react';
import { Plus, MoreVertical, Pencil, Trash2, PowerOff } from 'lucide-react';
import PageLayout from '@/components/layout/PageLayout';
import GoalForm from '@/components/goals/GoalForm';
import { useGoalStore } from '@/stores/goalStore';
import { useAuthStore } from '@/stores/authStore';
import { getCategoryById } from '@/constants/categories';
import type { Goal, GoalPeriod, RepeatType } from '@/types';
import { formatDuration } from '@/utils/progressUtils';

const PERIOD_LABELS: Record<GoalPeriod, string> = {
  daily: 'Günlük',
  weekly: 'Haftalık',
  monthly: 'Aylık',
  yearly: 'Yıllık',
};

const REPEAT_LABELS: Record<RepeatType, string> = {
  none: '',
  daily: 'Her Gün',
  weekdays: 'Hafta İçi',
  custom: 'Özel Günler',
};

function getRepeatLabel(goal: Goal): string {
  if (goal.period !== 'daily') return '';
  const rt: RepeatType = goal.repeatType ?? 'none';
  if (rt === 'none') return 'Tek Seferlik';
  return REPEAT_LABELS[rt];
}

export default function Management() {
  const { goals, deleteGoal, toggleGoalActive } = useGoalStore();
  const { user } = useAuthStore();
  const [showForm, setShowForm] = useState(false);
  const [editGoal, setEditGoal] = useState<Goal | undefined>();
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [filterPeriod, setFilterPeriod] = useState<GoalPeriod | 'all'>('all');
  const [filterActive, setFilterActive] = useState<'all' | 'active' | 'passive'>('all');

  const userGoals = goals.filter((g) => g.userId === user?.id);
  const filtered = userGoals.filter((g) => {
    if (filterPeriod !== 'all' && g.period !== filterPeriod) return false;
    if (filterActive === 'active' && !g.isActive) return false;
    if (filterActive === 'passive' && g.isActive) return false;
    return true;
  });

  const activeCount = userGoals.filter((g) => g.isActive).length;
  const completionSum = userGoals.length > 0 ? Math.round((activeCount / userGoals.length) * 100) : 0;

  const handleEdit = (goal: Goal) => {
    setEditGoal(goal);
    setShowForm(true);
    setOpenMenuId(null);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Bu hedefi silmek istediğinize emin misiniz?')) {
      await deleteGoal(id);
    }
    setOpenMenuId(null);
  };

  const handleToggle = async (id: string) => {
    await toggleGoalActive(id);
    setOpenMenuId(null);
  };

  return (
    <PageLayout
      title="Hedef Yönetimi"
      headerRight={
        <button
          onClick={() => { setEditGoal(undefined); setShowForm(true); }}
          className="flex items-center gap-1.5 bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-indigo-700 transition"
        >
          <Plus size={16} />
          Ekle
        </button>
      }
    >
      {/* Özet */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-3 text-center shadow-sm">
          <div className="text-2xl font-bold text-gray-900 dark:text-white">{userGoals.length}</div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Toplam</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-3 text-center shadow-sm">
          <div className="text-2xl font-bold text-green-600">{activeCount}</div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Aktif</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-3 text-center shadow-sm">
          <div className="text-2xl font-bold text-indigo-600">%{completionSum}</div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Aktif Oran</div>
        </div>
      </div>

      {/* Filtreler */}
      <div className="flex gap-2 mb-4 overflow-x-auto scrollbar-hide">
        {(['all', 'daily', 'weekly', 'monthly', 'yearly'] as const).map((p) => (
          <button
            key={p}
            onClick={() => setFilterPeriod(p)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition ${
              filterPeriod === p
                ? 'bg-indigo-600 text-white'
                : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-600'
            }`}
          >
            {p === 'all' ? 'Tümü' : PERIOD_LABELS[p]}
          </button>
        ))}
        <div className="h-5 w-px bg-gray-200 dark:bg-gray-600 self-center mx-1" />
        {(['all', 'active', 'passive'] as const).map((s) => (
          <button
            key={s}
            onClick={() => setFilterActive(s)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition ${
              filterActive === s
                ? 'bg-gray-800 text-white'
                : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-600'
            }`}
          >
            {s === 'all' ? 'Hepsi' : s === 'active' ? 'Aktif' : 'Pasif'}
          </button>
        ))}
      </div>

      {/* Liste */}
      {filtered.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-10 text-center shadow-sm">
          <div className="text-4xl mb-3">🎯</div>
          <p className="text-gray-500 dark:text-gray-400 font-medium">Henüz hedef yok</p>
          <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">Sağ üstteki + butonu ile hedef ekleyin</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((goal) => {
            const cat = getCategoryById(goal.categoryId);
            return (
              <div
                key={goal.id}
                className={`bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm flex items-center gap-3 transition ${
                  !goal.isActive ? 'opacity-60' : ''
                }`}
              >
                {/* Category icon */}
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                  style={{ backgroundColor: (cat?.color ?? '#6366f1') + '20' }}
                >
                  {cat?.icon}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 dark:text-white text-sm truncate">{goal.title}</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                    {PERIOD_LABELS[goal.period]}
                    {getRepeatLabel(goal) && (
                      <span className="ml-1 text-indigo-400 font-medium">· {getRepeatLabel(goal)}</span>
                    )}
                    {' · '}{formatDuration(goal.targetValue, goal.targetUnit)}
                    {' · '}<span className={goal.isActive ? 'text-green-500' : 'text-gray-400'}>
                      {goal.isActive ? 'Aktif' : 'Pasif'}
                    </span>
                  </p>
                  {goal.period === 'daily' && goal.endDate && (
                    <p className="text-xs text-gray-300 dark:text-gray-600 mt-0.5">
                      Bitiş: {new Date(goal.endDate + 'T00:00:00').toLocaleDateString('tr-TR')}
                    </p>
                  )}
                </div>

                {/* Menu */}
                <div className="relative">
                  <button
                    onClick={() =>
                      setOpenMenuId(openMenuId === goal.id ? null : goal.id)
                    }
                    className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                  >
                    <MoreVertical size={18} />
                  </button>

                  {openMenuId === goal.id && (
                    <>
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setOpenMenuId(null)}
                      />
                      <div className="absolute right-0 top-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 z-20 min-w-36 overflow-hidden">
                        <button
                          onClick={() => handleEdit(goal)}
                          className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                        >
                          <Pencil size={14} />
                          Düzenle
                        </button>
                        <button
                          onClick={() => handleToggle(goal.id)}
                          className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                        >
                          <PowerOff size={14} />
                          {goal.isActive ? 'Pasifleştir' : 'Aktifleştir'}
                        </button>
                        <button
                          onClick={() => handleDelete(goal.id)}
                          className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition"
                        >
                          <Trash2 size={14} />
                          Sil
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showForm && (
        <GoalForm
          onClose={() => { setShowForm(false); setEditGoal(undefined); }}
          editGoal={editGoal}
        />
      )}
    </PageLayout>
  );
}
