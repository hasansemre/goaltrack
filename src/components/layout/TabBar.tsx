import { NavLink } from 'react-router-dom';
import { Home, LayoutDashboard, BarChart3, Award, User } from 'lucide-react';

const tabs = [
  { to: '/', label: 'Ana Sayfa', icon: Home, exact: true },
  { to: '/management', label: 'Panel', icon: LayoutDashboard, exact: false },
  { to: '/statistics', label: 'İstatistik', icon: BarChart3, exact: false },
  { to: '/badges', label: 'Rozetler', icon: Award, exact: false },
  { to: '/profile', label: 'Profil', icon: User, exact: false },
];

export default function TabBar() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 z-50 safe-area-bottom">
      <div className="max-w-lg mx-auto flex items-center justify-around px-2 py-2">
        {tabs.map(({ to, label, icon: Icon, exact }) => (
          <NavLink
            key={to}
            to={to}
            end={exact}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition-all ${
                isActive
                  ? 'text-indigo-600 dark:text-indigo-400'
                  : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon size={22} strokeWidth={isActive ? 2.5 : 1.8} />
                <span className={`text-xs font-medium ${isActive ? 'text-indigo-600 dark:text-indigo-400' : ''}`}>
                  {label}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
