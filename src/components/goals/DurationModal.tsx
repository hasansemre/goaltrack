import { useState } from 'react';
import { X } from 'lucide-react';
import type { Goal } from '@/types';
import { getCategoryById } from '@/constants/categories';
import { formatDuration } from '@/utils/progressUtils';

interface Props {
  goal: Goal;
  onClose: () => void;
  onSubmit: (value: number) => void;
}

export default function DurationModal({ goal, onClose, onSubmit }: Props) {
  const cat = getCategoryById(goal.categoryId);
  const [value, setValue] = useState(goal.targetValue);

  const quickOptions =
    goal.targetUnit === 'seconds'
      ? [15, 30, 45, 60, 90]
      : goal.targetUnit === 'minutes'
      ? [15, 20, 30, 45, 60]
      : [0.5, 1, 1.5, 2, 3];

  const unitLabel =
    goal.targetUnit === 'seconds' ? 'saniye' : goal.targetUnit === 'minutes' ? 'dakika' : 'saat';

  const quickLabel = (opt: number) => {
    if (goal.targetUnit === 'seconds') return `${opt}sn`;
    if (goal.targetUnit === 'minutes') return `${opt}dk`;
    return `${opt}s`;
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-[100] flex items-end sm:items-center justify-center">
      <div
        className="bg-white dark:bg-gray-800 rounded-t-3xl sm:rounded-2xl w-full max-w-sm flex flex-col"
        style={{ maxHeight: 'calc(100dvh - env(safe-area-inset-top, 0px) - 1rem)' }}
      >
        {/* Header — sabit */}
        <div className="flex-shrink-0 flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <span className="text-xl">{cat?.icon}</span>
            <div>
              <p className="font-bold text-gray-900 dark:text-white text-sm">{goal.title}</p>
              <p className="text-xs text-gray-400 dark:text-gray-500">
                Hedef: {formatDuration(goal.targetValue, goal.targetUnit)}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
            <X size={20} />
          </button>
        </div>

        {/* İçerik — scroll edilebilir */}
        <div className="flex-1 overflow-y-auto p-5">
          <p className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3">Ne kadar süre harcadın?</p>

          {/* Hızlı seçenekler */}
          <div className="grid grid-cols-5 gap-2 mb-4">
            {quickOptions.map((opt) => (
              <button
                key={opt}
                onClick={() => setValue(opt)}
                className={`py-2 rounded-xl text-sm font-medium border-2 transition ${
                  value === opt
                    ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300'
                    : 'border-gray-100 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-500'
                }`}
              >
                {quickLabel(opt)}
              </button>
            ))}
          </div>

          {/* Özel değer */}
          <div className="flex items-center gap-3">
            <input
              type="number"
              value={value}
              onChange={(e) => setValue(Number(e.target.value))}
              min={0}
              step={goal.targetUnit === 'seconds' ? 5 : goal.targetUnit === 'minutes' ? 5 : 0.5}
              className="flex-1 px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl text-center text-lg font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
            />
            <span className="text-gray-500 dark:text-gray-400 font-medium w-16">
              {unitLabel}
            </span>
          </div>
        </div>

        {/* Butonlar — her zaman görünür */}
        <div
          className="flex-shrink-0 px-5 pt-3 border-t border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 flex gap-3"
          style={{ paddingBottom: 'max(1.25rem, env(safe-area-inset-bottom, 0px))' }}
        >
          <button
            onClick={onClose}
            className="flex-1 py-3 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-600 dark:text-gray-300 font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition"
          >
            İptal
          </button>
          <button
            onClick={() => onSubmit(value)}
            className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold transition"
          >
            Tamamla
          </button>
        </div>
      </div>
    </div>
  );
}
