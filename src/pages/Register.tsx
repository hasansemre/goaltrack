import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { useGoalStore } from '@/stores/goalStore';
import { useBadgeStore } from '@/stores/badgeStore';
import { generateId } from '@/utils/idUtils';
import type { User } from '@/types';
import { format } from 'date-fns';

export default function Register() {
  const [name, setName] = useState('');
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
      const storedUsers = JSON.parse(localStorage.getItem('gt_users') ?? '[]') as Array<{ id: string; email: string; passwordHash: string; name: string; createdAt: string }>;
      const exists = storedUsers.some((u) => u.email === email);
      if (exists) {
        setError('Bu e-posta adresi zaten kayıtlı.');
        return;
      }

      const userId = generateId();
      const now = format(new Date(), "yyyy-MM-dd'T'HH:mm:ss");
      const newUserRecord = {
        id: userId,
        email,
        name,
        passwordHash: btoa(password),
        createdAt: now,
      };

      localStorage.setItem('gt_users', JSON.stringify([...storedUsers, newUserRecord]));

      const user: User = {
        id: userId,
        email,
        name,
        createdAt: new Date(now),
        updatedAt: new Date(now),
      };

      setAuth(user, `local-token-${userId}`);
      await loadGoals(userId);
      await loadTodayLogs(userId);
      await loadUserBadges(userId);
      navigate('/');
    } catch {
      setError('Bir hata oluştu, tekrar deneyin.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🎯</div>
          <h1 className="text-3xl font-bold text-gray-900">GoalTrack</h1>
          <p className="text-gray-500 mt-1">Hedeflerine ulaşmanın en kolay yolu</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">Hesap Oluştur</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ad Soyad</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                placeholder="Adınız Soyadınız"
              />
            </div>

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
                minLength={6}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                placeholder="En az 6 karakter"
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
              {isLoading ? 'Kaydediliyor...' : 'Kayıt Ol'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Zaten hesabın var mı?{' '}
            <Link to="/login" className="text-indigo-600 font-medium hover:underline">
              Giriş Yap
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
