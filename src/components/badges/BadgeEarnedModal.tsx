import { motion } from 'framer-motion';
import type { Badge, BadgeTier } from '@/types';

interface Props {
  badges: Badge[];
  onClose: () => void;
}

const tierColors: Record<BadgeTier, string> = {
  bronze: 'from-amber-700 to-amber-500',
  silver: 'from-gray-500 to-gray-300',
  gold: 'from-yellow-500 to-yellow-300',
  platinum: 'from-cyan-500 to-blue-400',
};

const tierLabels: Record<BadgeTier, string> = {
  bronze: 'Bronz',
  silver: 'Gümüş',
  gold: 'Altın',
  platinum: 'Platin',
};

export default function BadgeEarnedModal({ badges, onClose }: Props) {
  const badge = badges[0];
  if (!badge) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', damping: 15 }}
        className="bg-white dark:bg-gray-800 rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl"
      >
        {/* Confetti emoji */}
        <div className="text-4xl mb-2">🎉</div>

        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">Rozet Kazandın!</h2>
        <p className="text-sm text-gray-400 dark:text-gray-500 mb-6">Harika iş, devam et!</p>

        {/* Badge */}
        <div className="flex justify-center mb-6">
          <motion.div
            animate={{ rotate: [0, -5, 5, -5, 5, 0] }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className={`w-28 h-28 rounded-full bg-gradient-to-br ${tierColors[badge.tier]} flex items-center justify-center shadow-lg`}
          >
            <span className="text-5xl">{badge.icon}</span>
          </motion.div>
        </div>

        <div
          className={`inline-block px-3 py-1 rounded-full text-xs font-bold text-white bg-gradient-to-r ${tierColors[badge.tier]} mb-3`}
        >
          {tierLabels[badge.tier]}
        </div>

        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{badge.name}</h3>
        <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">{badge.description}</p>

        {badges.length > 1 && (
          <p className="text-indigo-600 text-sm font-medium mb-4">
            +{badges.length - 1} rozet daha kazandın!
          </p>
        )}

        <button
          onClick={onClose}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-xl transition"
        >
          Harika!
        </button>
      </motion.div>
    </div>
  );
}
