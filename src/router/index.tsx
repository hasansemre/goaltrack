import { lazy, Suspense } from 'react';
import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';

const Login = lazy(() => import('@/pages/Login'));
const Register = lazy(() => import('@/pages/Register'));
const Dashboard = lazy(() => import('@/pages/Dashboard'));
const Management = lazy(() => import('@/pages/Management'));
const Statistics = lazy(() => import('@/pages/Statistics'));
const Badges = lazy(() => import('@/pages/Badges'));
const Profile = lazy(() => import('@/pages/Profile'));

function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
      <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

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

function withSuspense(Component: React.ComponentType) {
  return (
    <Suspense fallback={<PageLoader />}>
      <Component />
    </Suspense>
  );
}

export const router = createBrowserRouter(
  [
    {
      element: <GuestRoute />,
      children: [
        { path: '/login', element: withSuspense(Login) },
        { path: '/register', element: withSuspense(Register) },
      ],
    },
    {
      element: <ProtectedRoute />,
      children: [
        { path: '/', element: withSuspense(Dashboard) },
        { path: '/management', element: withSuspense(Management) },
        { path: '/statistics', element: withSuspense(Statistics) },
        { path: '/badges', element: withSuspense(Badges) },
        { path: '/profile', element: withSuspense(Profile) },
      ],
    },
    { path: '*', element: <Navigate to="/" replace /> },
  ],
  { basename: '/goaltrack' }
);
