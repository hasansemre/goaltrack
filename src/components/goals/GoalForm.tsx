import { useState } from 'react';
import { CATEGORIES } from '@/constants/categories';
import { useGoalStore } from '@/stores/goalStore';
import { useAuthStore } from '@/stores/authStore';
import type { Goal, GoalPeriod, DurationUnit, CategoryId, RepeatType } from '@/types';
import { format } from 'date-fns';
import { X } from 'lucide-react';

interface Props {
  onClose: () => void;
  editGoal?: Goal;
}

const PERIODS: { value: GoalPeriod; label: string }[] = [
  { value: 'daily', label: 'Günlük' },
  { value: 'weekly', label: 'Haftalık' },
  { value: 'monthly', label: 'Aylık' },
  { value: 'yearly', label: 'Yıllık' },
];

const REPEAT_OPTIONS: { value: RepeatType; label: string; desc: string }[] = [
  { value: 'none', label: 'Bir Kez', desc: 'Sadece seçilen günde' },
  { value: 'daily', label: 'Her Gün', desc: 'Her gün tekrar eder' },
  { value: 'weekdays', label: 'Hafta İçi', desc: 'Pzt–Cum arası' },
  { value: 'custom', label: 'Özel', desc: 'Günleri sen seç' },
];

const WEEK_DAYS: { value: number; short: string }[] = [
  { value: 1, short: 'Pzt' },
  { value: 2, short: 'Sal' },
  { value: 3, short: 'Çar' },
  { value: 4, short: 'Per' },
  { value: 5, short: 'Cum' },
  { value: 6, short: 'Cmt' },
  { value: 0, short: 'Paz' },
];

export default function GoalForm({ onClose, editGoal }: Props) {
  const { user } = useAuthStore();
  const { addGoal, updateGoal } = useGoalStore();

  const [categoryId, setCategoryId] = useState<CategoryId>(editGoal?.categoryId ?? 'walking');
  const [title, setTitle] = useState(editGoal?.title ?? '');
  const [period, setPeriod] = useState<GoalPeriod>(editGoal?.period ?? 'daily');
  const [targetValue, setTargetValue] = useState(editGoal?.targetValue ?? 30);
  const [targetUnit, setTargetUnit] = useState<DurationUnit>(editGoal?.targetUnit ?? 'minutes');
  const [startDate, setStartDate] = useState(editGoal?.startDate ?? format(new Date(), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState(editGoal?.endDate ?? '');
  const [repeatType, setRepeatType] = useState<RepeatType>(editGoal?.repeatType ?? 'none');
  const [repeatDays, setRepeatDays] = useState<number[]>(editGoal?.repeatDays ?? []);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handlePeriodChange = (p: GoalPeriod) => {
    setPeriod(p);
    if (p !== 'daily') setTargetUnit('hours');
  };

  const toggleRepeatDay = (day: number) => {
    setRepeatDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsSubmitting(true);

    const repeatData =
      period === 'daily'
        ? {
            repeatType,
            repeatDays: repeatType === 'custom' ? repeatDays : undefined,
            endDate: endDate || undefined,
          }
        : { repeatType: 'none' as RepeatType, repeatDays: undefined, endDate: undefined };

    try {
      if (editGoal) {
        await updateGoal(editGoal.id, { categoryId, title, period, targetValue, targetUnit, startDate, ...repeatData });
      } else {
        await addGoal({ userId: user.id, categoryId, title, period, targetValue, targetUnit, startDate, isActive: true, ...repeatData });
      }
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedCategory = CATEGORIES.find((c) => c.id === categoryId);

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-700">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">
            {editGoal ? 'Hedefi Düzenle' : 'Yeni Hedef'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition">
            <X size={22} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-5">
          {/* Kategori */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3">Kategori</label>
            <div className="grid grid-cols-4 gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategoryId(cat.id)}
                  className={`flex flex-col items-center gap-1 p-2 rounded-xl border-2 transition ${
                    categoryId === cat.id ? 'border-current' : 'border-gray-100 dark:border-gray-600 hover:border-gray-200 dark:hover:border-gray-500'
                  }`}
                  style={categoryId === cat.id ? { borderColor: cat.color, backgroundColor: cat.color + '18' } : {}}
                >
                  <span className="text-xl">{cat.icon}</span>
                  <span className="text-xs text-gray-600 dark:text-gray-300 font-medium leading-tight text-center">
                    {cat.name}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Ad */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">Hedef Adı</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder={`ör: Sabah ${selectedCategory?.name}`}
              className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
            />
          </div>

          {/* Periyot */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">Periyot</label>
            <div className="grid grid-cols-4 gap-2">
              {PERIODS.map(({ value, label }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => handlePeriodChange(value)}
                  className={`py-2 rounded-xl text-sm font-medium border-2 transition ${
                    period === value
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:border-indigo-300'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Hedef Süre */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">Hedef Süre</label>
            <div className="flex gap-3">
              <input
                type="number"
                value={targetValue}
                onChange={(e) => setTargetValue(Number(e.target.value))}
                min={1}
                required
                className="flex-1 px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition dark:bg-gray-700 dark:text-white"
              />
              {period === 'daily' ? (
                <select
                  value={targetUnit}
                  onChange={(e) => setTargetUnit(e.target.value as DurationUnit)}
                  className="flex-1 px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition bg-white dark:bg-gray-700 dark:text-white"
                >
                  <option value="seconds">Saniye</option>
                  <option value="minutes">Dakika</option>
                  <option value="hours">Saat</option>
                </select>
              ) : (
                <div className="flex-1 px-4 py-3 border border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50 rounded-xl text-gray-500 dark:text-gray-400">
                  Saat
                </div>
              )}
            </div>
          </div>

          {/* Başlangıç Tarihi */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">Başlangıç Tarihi</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition dark:bg-gray-700 dark:text-white"
            />
          </div>

          {/* Günlük hedefler için: Tekrar + Bitiş Tarihi */}
          {period === 'daily' && (
            <>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">Tekrar</label>
                <div className="grid grid-cols-2 gap-2">
                  {REPEAT_OPTIONS.map(({ value, label, desc }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setRepeatType(value)}
                      className={`flex flex-col items-start px-3 py-2.5 rounded-xl border-2 transition text-left ${
                        repeatType === value
                          ? 'bg-indigo-50 dark:bg-indigo-900/30 border-indigo-500'
                          : 'border-gray-200 dark:border-gray-600 hover:border-indigo-300'
                      }`}
                    >
                      <span className={`text-sm font-semibold ${repeatType === value ? 'text-indigo-700 dark:text-indigo-300' : 'text-gray-700 dark:text-gray-200'}`}>
                        {label}
                      </span>
                      <span className={`text-xs mt-0.5 ${repeatType === value ? 'text-indigo-500 dark:text-indigo-400' : 'text-gray-400 dark:text-gray-500'}`}>
                        {desc}
                      </span>
                    </button>
                  ))}
                </div>

                {repeatType === 'custom' && (
                  <div className="mt-3">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Hangi günler?</p>
                    <div className="flex gap-1.5 flex-wrap">
                      {WEEK_DAYS.map(({ value, short }) => (
                        <button
                          key={value}
                          type="button"
                          onClick={() => toggleRepeatDay(value)}
                          className={`w-10 h-10 rounded-xl text-xs font-bold border-2 transition ${
                            repeatDays.includes(value)
                              ? 'bg-indigo-600 text-white border-indigo-600'
                              : 'border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:border-indigo-300'
                          }`}
                        >
                          {short}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {repeatType !== 'none' && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                    Bitiş Tarihi
                    <span className="text-gray-400 dark:text-gray-500 font-normal ml-1">(isteğe bağlı)</span>
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    min={startDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition dark:bg-gray-700 dark:text-white"
                  />
                  {endDate && (
                    <button
                      type="button"
                      onClick={() => setEndDate('')}
                      className="text-xs text-gray-400 hover:text-red-500 mt-1 transition"
                    >
                      Bitiş tarihini kaldır
                    </button>
                  )}
                </div>
              )}
            </>
          )}

          {/* Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-600 dark:text-gray-300 font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition"
            >
              İptal
            </button>
            <button
              type="submit"
              disabled={isSubmitting || (repeatType === 'custom' && repeatDays.length === 0)}
              className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold transition disabled:opacity-50"
            >
              {isSubmitting ? 'Kaydediliyor...' : 'Kaydet'}
            </button>
          </div>
          {repeatType === 'custom' && repeatDays.length === 0 && (
            <p className="text-xs text-red-500 text-center -mt-3">En az bir gün seçin</p>
          )}
        </form>
      </div>
    </div>
  );
}
