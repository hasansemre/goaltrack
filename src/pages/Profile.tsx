import { useState } from 'react';
import { LogOut, User as UserIcon, Trophy, Target, Flame, Moon, Sun } from 'lucide-react';
import PageLayout from '@/components/layout/PageLayout';
import { useAuthStore } from '@/stores/authStore';
import { useGoalStore } from '@/stores/goalStore';
import { useBadgeStore } from '@/stores/badgeStore';
import { useThemeStore } from '@/stores/themeStore';
import { useNavigate } from 'react-router-dom';
import { db } from '@/services/db/database';

export default function Profile() {
  const { user, clearAuth, updateUser } = useAuthStore();
  const { goals, loadGoals } = useGoalStore();
  const { userBadges } = useBadgeStore();
  const { isDark, toggle } = useThemeStore();
  const navigate = useNavigate();
  const [editName, setEditName] = useState(false);
  const [name, setName] = useState(user?.name ?? '');
  const [isSaving, setIsSaving] = useState(false);

  const userGoals = goals.filter((g) => g.userId === user?.id && g.isActive);

  const handleSaveName = async () => {
    if (!user || !name.trim()) return;
    setIsSaving(true);
    const storedUsers = JSON.parse(localStorage.getItem('gt_users') ?? '[]') as Array<{ id: string; name: string }>;
    const updated = storedUsers.map((u) => u.id === user.id ? { ...u, name: name.trim() } : u);
    localStorage.setItem('gt_users', JSON.stringify(updated));
    updateUser({ name: name.trim() });
    setEditName(false);
    setIsSaving(false);
  };

  const handleLogout = async () => {
    clearAuth();
    navigate('/login');
  };

  void loadGoals; void db;

  return (
    <PageLayout title="Profil">
      {/* Avatar + isim */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm mb-4 text-center">
        <div className="w-20 h-20 bg-gradient-to-br from-indigo-400 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-3 text-3xl text-white font-bold">
          {user?.name?.charAt(0).toUpperCase() ?? '?'}
        </div>

        {editName ? (
          <div className="flex gap-2 justify-center">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="border border-gray-200 dark:border-gray-600 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
            />
            <button
              onClick={handleSaveName}
              disabled={isSaving}
              className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-medium"
            >
              Kaydet
            </button>
          </div>
        ) : (
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">{user?.name}</h2>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-0.5">{user?.email}</p>
            <button
              onClick={() => setEditName(true)}
              className="text-indigo-600 dark:text-indigo-400 text-sm font-medium mt-2 hover:underline"
            >
              İsmi Düzenle
            </button>
          </div>
        )}
      </div>

      {/* İstatistik kartlar */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 text-center shadow-sm">
          <Target size={20} className="text-indigo-500 mx-auto mb-1" />
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{userGoals.length}</p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">Aktif Hedef</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 text-center shadow-sm">
          <Trophy size={20} className="text-yellow-500 mx-auto mb-1" />
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{userBadges.length}</p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">Rozet</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 text-center shadow-sm">
          <Flame size={20} className="text-orange-500 mx-auto mb-1" />
          <p className="text-2xl font-bold text-gray-900 dark:text-white">—</p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">En Uzun</p>
        </div>
      </div>

      {/* Ayarlar */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm overflow-hidden mb-4">
        {/* Tema toggle */}
        <div className="flex items-center gap-3 p-4 border-b border-gray-50 dark:border-gray-700">
          <div className="w-9 h-9 bg-gray-100 dark:bg-gray-700 rounded-xl flex items-center justify-center">
            {isDark
              ? <Moon size={18} className="text-indigo-400" />
              : <Sun size={18} className="text-yellow-500" />
            }
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-gray-900 dark:text-white">
              {isDark ? 'Koyu Tema' : 'Açık Tema'}
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500">Görünümü değiştir</p>
          </div>
          {/* Toggle switch */}
          <button
            onClick={toggle}
            className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${
              isDark ? 'bg-indigo-600' : 'bg-gray-200'
            }`}
          >
            <span
              className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-300 ${
                isDark ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        <div className="flex items-center gap-3 p-4 border-b border-gray-50 dark:border-gray-700">
          <div className="w-9 h-9 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center">
            <UserIcon size={18} className="text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900 dark:text-white">Hesap Bilgileri</p>
            <p className="text-xs text-gray-400 dark:text-gray-500">{user?.email}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 p-4 border-b border-gray-50 dark:border-gray-700">
          <div className="w-9 h-9 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl flex items-center justify-center">
            <Trophy size={18} className="text-yellow-600 dark:text-yellow-500" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900 dark:text-white">Rozetlerim</p>
            <p className="text-xs text-gray-400 dark:text-gray-500">{userBadges.length} rozet kazanıldı</p>
          </div>
        </div>
      </div>

      {/* Uygulama Bilgisi */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm mb-4">
        <h3 className="text-sm font-bold text-gray-700 dark:text-gray-200 mb-2">Uygulama Hakkında</h3>
        <p className="text-xs text-gray-400 dark:text-gray-500 leading-relaxed">
          GoalTrack v1.0 — Kişisel hedef ve alışkanlık takip uygulaması.
          Verileriniz cihazınızda güvenle saklanmaktadır.
        </p>
      </div>

      {/* Çıkış */}
      <button
        onClick={handleLogout}
        className="w-full flex items-center justify-center gap-2 py-3 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 font-semibold rounded-2xl transition"
      >
        <LogOut size={18} />
        Çıkış Yap
      </button>
    </PageLayout>
  );
}
