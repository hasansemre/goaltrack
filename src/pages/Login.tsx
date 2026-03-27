import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { useGoalStore } from '@/stores/goalStore';
import { useBadgeStore } from '@/stores/badgeStore';
import { db } from '@/services/db/database';
import { generateId } from '@/utils/idUtils';
import { format } from 'date-fns';
import type { User } from '@/types';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { setAuth } = useAuthStore();
  const { loadGoals, loadTodayLogs } = useGoalStore();
  const { loadUserBadges } = useBadgeStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Offline-first: Kullanıcıyı localStorage'dan kontrol et
      const storedUsers = JSON.parse(localStorage.getItem('gt_users') ?? '[]') as Array<{ id: string; email: string; passwordHash: string; name: string; createdAt: string }>;
      const found = storedUsers.find(
        (u) => u.email === email && u.passwordHash === btoa(password)
      );

      if (!found) {
        setError('E-posta veya şifre hatalı.');
        return;
      }

      const user: User = {
        id: found.id,
        email: found.email,
        name: found.name,
        createdAt: new Date(found.createdAt),
        updatedAt: new Date(found.createdAt),
      };

      setAuth(user, `local-token-${user.id}`);
      await loadGoals(user.id);
      await loadTodayLogs(user.id);
      await loadUserBadges(user.id);
      navigate('/');
    } catch {
      setError('Bir hata oluştu, tekrar deneyin.');
    } finally {
      setIsLoading(false);
    }
  };

  void db; void generateId; void format;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🎯</div>
          <h1 className="text-3xl font-bold text-gray-900">GoalTrack</h1>
          <p className="text-gray-500 mt-1">Hedeflerine ulaşmanın en kolay yolu</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">Giriş Yap</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">E-posta</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                placeholder="ornek@email.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Şifre</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-xl transition disabled:opacity-50"
            >
              {isLoading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Hesabın yok mu?{' '}
            <Link to="/register" className="text-indigo-600 font-medium hover:underline">
              Kayıt Ol
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
