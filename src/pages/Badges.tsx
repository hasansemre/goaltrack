import { useEffect, useState } from 'react';
import PageLayout from '@/components/layout/PageLayout';
import { useBadgeStore } from '@/stores/badgeStore';
import { useAuthStore } from '@/stores/authStore';
import { BADGES, getBadgesByCategory } from '@/constants/badges';
import { CATEGORIES } from '@/constants/categories';
import type { BadgeTier } from '@/types';

const TIER_COLORS: Record<BadgeTier, string> = {
  bronze: 'from-amber-600 to-amber-400',
  silver: 'from-gray-400 to-gray-300',
  gold: 'from-yellow-500 to-yellow-300',
  platinum: 'from-cyan-500 to-blue-400',
};

const TIER_BG: Record<BadgeTier, string> = {
  bronze: 'bg-amber-500',
  silver: 'bg-gray-400',
  gold: 'bg-yellow-400',
  platinum: 'bg-cyan-500',
};

const TIER_LABELS: Record<BadgeTier, string> = {
  bronze: 'Bronz',
  silver: 'Gümüş',
  gold: 'Altın',
  platinum: 'Platin',
};

export default function Badges() {
  const { user } = useAuthStore();
  const { userBadges, loadUserBadges } = useBadgeStore();
  const [filter, setFilter] = useState<'all' | 'earned' | 'locked'>('all');
  const [selectedBadge, setSelectedBadge] = useState<string | null>(null);

  useEffect(() => {
    if (user) loadUserBadges(user.id);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const earnedIds = new Set(userBadges.map((b) => b.badgeId));
  const earnedCount = earnedIds.size;
  const universalBadges = BADGES.filter((b) => !b.categoryId);

  const filterBadge = (badgeId: string) => {
    if (filter === 'earned') return earnedIds.has(badgeId);
    if (filter === 'locked') return !earnedIds.has(badgeId);
    return true;
  };

  return (
    <PageLayout title="Rozetlerim">
      {/* Özet */}
      <div className="bg-gradient-to-r from-purple-500 to-indigo-600 rounded-2xl p-5 text-white mb-5 shadow-lg">
        <div className="flex items-center justify-between mb-2">
          <div>
            <p className="text-purple-100 text-sm font-medium">Toplam Kazanılan</p>
            <p className="text-4xl font-bold mt-1">{earnedCount}</p>
          </div>
          <div className="text-right">
            <p className="text-purple-200 text-lg font-bold">/ {BADGES.length}</p>
            <p className="text-purple-300 text-xs mt-0.5">rozet</p>
          </div>
        </div>
        <div className="bg-white/20 rounded-full h-2 mt-3">
          <div className="bg-white rounded-full h-2 transition-all"
            style={{ width: `${(earnedCount / BADGES.length) * 100}%` }} />
        </div>
        {/* Tier özet */}
        <div className="grid grid-cols-4 gap-2 mt-4">
          {(['bronze', 'silver', 'gold', 'platinum'] as BadgeTier[]).map((tier) => {
            const total = BADGES.filter((b) => b.tier === tier).length;
            const earned = BADGES.filter((b) => b.tier === tier && earnedIds.has(b.id)).length;
            return (
              <div key={tier} className="bg-white/10 rounded-xl p-2 text-center">
                <p className="text-white font-bold text-sm">{earned}/{total}</p>
                <p className="text-white/60 text-xs">{TIER_LABELS[tier]}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Filter */}
      <div className="flex gap-2 mb-5">
        {(['all', 'earned', 'locked'] as const).map((f) => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${
              filter === f ? 'bg-indigo-600 text-white' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-600'
            }`}>
            {f === 'all' ? 'Tümü' : f === 'earned' ? `Kazanılan (${earnedCount})` : 'Kilitli'}
          </button>
        ))}
      </div>

      {/* Kategoriye göre rozetler */}
      {CATEGORIES.map((cat) => {
        const catBadges = getBadgesByCategory(cat.id).filter((b) => filterBadge(b.id));
        if (catBadges.length === 0) return null;
        const catEarned = getBadgesByCategory(cat.id).filter((b) => earnedIds.has(b.id)).length;
        const catTotal = getBadgesByCategory(cat.id).length;

        return (
          <div key={cat.id} className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-lg">{cat.icon}</span>
              <h3 className="text-sm font-bold text-gray-800 dark:text-gray-100">{cat.name}</h3>
              <span className="text-xs text-gray-400 dark:text-gray-500 ml-auto">{catEarned}/{catTotal}</span>
            </div>

            <div className="grid grid-cols-4 gap-2">
              {catBadges.map((badge) => {
                const earned = earnedIds.has(badge.id);
                const ub = userBadges.find((b) => b.badgeId === badge.id);
                const isSelected = selectedBadge === badge.id;

                return (
                  <div key={badge.id}>
                    <button
                      onClick={() => setSelectedBadge(isSelected ? null : badge.id)}
                      className={`w-full flex flex-col items-center gap-1.5 p-2 rounded-xl border-2 transition ${
                        earned
                          ? `border-transparent bg-gradient-to-br ${TIER_COLORS[badge.tier]} shadow-sm`
                          : 'border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 hover:border-gray-200 dark:hover:border-gray-600'
                      }`}
                    >
                      <span className={`text-2xl ${earned ? '' : 'grayscale opacity-30'}`}>
                        {badge.icon}
                      </span>
                      <span className={`text-xs font-medium text-center leading-tight ${earned ? 'text-white' : 'text-gray-300 dark:text-gray-600'}`}>
                        {badge.name}
                      </span>
                      {earned && (
                        <span className={`text-xs px-1.5 rounded-full text-white/80 ${TIER_BG[badge.tier]}`}>
                          {TIER_LABELS[badge.tier]}
                        </span>
                      )}
                    </button>

                    {/* Detay popup */}
                    {isSelected && (
                      <div className="col-span-4 mt-1 bg-white dark:bg-gray-800 rounded-xl p-3 border border-gray-100 dark:border-gray-700 shadow-sm">
                        <div className="flex items-start gap-3">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl bg-gradient-to-br ${TIER_COLORS[badge.tier]} flex-shrink-0`}>
                            {badge.icon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <p className="font-bold text-gray-900 dark:text-white text-sm">{badge.name}</p>
                              <span className={`text-xs px-2 py-0.5 rounded-full text-white ${TIER_BG[badge.tier]}`}>
                                {TIER_LABELS[badge.tier]}
                              </span>
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{badge.description}</p>
                            {earned && ub ? (
                              <p className="text-xs text-green-600 font-medium mt-1">
                                ✓ {new Date(ub.earnedAt).toLocaleDateString('tr-TR')} tarihinde kazanıldı
                              </p>
                            ) : (
                              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Henüz kazanılmadı</p>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* Evrensel rozetler */}
      {(() => {
        const filtered = universalBadges.filter((b) => filterBadge(b.id));
        if (filtered.length === 0) return null;
        const uEarned = universalBadges.filter((b) => earnedIds.has(b.id)).length;
        return (
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-lg">⭐</span>
              <h3 className="text-sm font-bold text-gray-800 dark:text-gray-100">Evrensel Rozetler</h3>
              <span className="text-xs text-gray-400 dark:text-gray-500 ml-auto">{uEarned}/{universalBadges.length}</span>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {filtered.map((badge) => {
                const earned = earnedIds.has(badge.id);
                const ub = userBadges.find((b) => b.badgeId === badge.id);
                const isSelected = selectedBadge === badge.id;
                return (
                  <div key={badge.id}>
                    <button
                      onClick={() => setSelectedBadge(isSelected ? null : badge.id)}
                      className={`w-full flex flex-col items-center gap-1.5 p-2 rounded-xl border-2 transition ${
                        earned
                          ? `border-transparent bg-gradient-to-br ${TIER_COLORS[badge.tier]} shadow-sm`
                          : 'border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 hover:border-gray-200 dark:hover:border-gray-600'
                      }`}
                    >
                      <span className={`text-2xl ${earned ? '' : 'grayscale opacity-30'}`}>{badge.icon}</span>
                      <span className={`text-xs font-medium text-center leading-tight ${earned ? 'text-white' : 'text-gray-300 dark:text-gray-600'}`}>
                        {badge.name}
                      </span>
                      {earned && (
                        <span className={`text-xs px-1.5 rounded-full text-white/80 ${TIER_BG[badge.tier]}`}>
                          {TIER_LABELS[badge.tier]}
                        </span>
                      )}
                    </button>
                    {isSelected && (
                      <div className="mt-1 bg-white dark:bg-gray-800 rounded-xl p-3 border border-gray-100 dark:border-gray-700 shadow-sm">
                        <div className="flex items-start gap-3">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl bg-gradient-to-br ${TIER_COLORS[badge.tier]} flex-shrink-0`}>
                            {badge.icon}
                          </div>
                          <div className="flex-1">
                            <p className="font-bold text-gray-900 dark:text-white text-sm">{badge.name}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{badge.description}</p>
                            {earned && ub ? (
                              <p className="text-xs text-green-600 font-medium mt-1">
                                ✓ {new Date(ub.earnedAt).toLocaleDateString('tr-TR')}
                              </p>
                            ) : (
                              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Henüz kazanılmadı</p>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })()}
    </PageLayout>
  );
}
