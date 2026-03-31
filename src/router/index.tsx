import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import Dashboard from '@/pages/Dashboard';
import Management from '@/pages/Management';
import Statistics from '@/pages/Statistics';
import Badges from '@/pages/Badges';
import Profile from '@/pages/Profile';

function ProtectedRoute() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <Outlet />;
}

function GuestRoute() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  if (isAuthenticated) return <Navigate to="/" replace />;
  return <Outlet />;
}

export const router = createBrowserRouter(
  [
    {
      element: <GuestRoute />,
      children: [
        { path: '/login', element: <Login /> },
        { path: '/register', element: <Register /> },
      ],
    },
    {
      element: <ProtectedRoute />,
      children: [
        { path: '/', element: <Dashboard /> },
        { path: '/management', element: <Management /> },
        { path: '/statistics', element: <Statistics /> },
        { path: '/badges', element: <Badges /> },
        { path: '/profile', element: <Profile /> },
      ],
    },
    { path: '*', element: <Navigate to="/" replace /> },
  ],
  { basename: '/goaltrack' }
);
