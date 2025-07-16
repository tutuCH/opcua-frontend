// src/sections.jsx
import { lazy, Suspense } from 'react';
import { Outlet, Navigate, useRoutes } from 'react-router-dom';

import DashboardLayout from 'src/layouts/dashboard';
import AuthMiddleware from 'src/components/AuthMiddleware';

export const FactoryPage = lazy(() => import('src/pages/factory'));
export const MachinePage = lazy(() => import('src/pages/machine'));
export const RecordsPage = lazy(() => import('src/pages/records'));
export const WarningsPage = lazy(() => import('src/pages/warnings'));
export const LoginPage = lazy(() => import('src/pages/login'));
export const SignupPage = lazy(() => import('src/pages/signup'));
export const ForgetPasswordPage = lazy(() => import('src/pages/forgotPassword'));
export const Page404 = lazy(() => import('src/pages/page-not-found'));

// ----------------------------------------------------------------------

export default function Router() {
  const routes = useRoutes([
    {
      element: (
        <AuthMiddleware>
          <DashboardLayout>
            <Suspense>
              <Outlet />
            </Suspense>
          </DashboardLayout>
        </AuthMiddleware>
      ),
      children: [
        { element: <FactoryPage />, index: true },
        { path: 'factory', element: <FactoryPage /> },
        { path: 'factory/:factoryId', element: <FactoryPage /> },
        { path: 'machine', element: <MachinePage /> },
        { path: 'machine/:machineId', element: <MachinePage /> },
        { path: 'records', element: <RecordsPage /> },
        { path: 'warnings', element: <WarningsPage /> },
      ],
    },
    {
      path: 'login',
      element: (
        <AuthMiddleware>
          <LoginPage />
        </AuthMiddleware>
      ),
    },
    {
      path: 'signup',
      element: (
        <AuthMiddleware>
          <SignupPage />
        </AuthMiddleware>
      ),
    },
    {
      path: 'forget-password',
      element: (
        <AuthMiddleware>
          <ForgetPasswordPage />
        </AuthMiddleware>
      ),
    },
    {
      path: '404',
      element: <Page404 />,
    },
    {
      path: '*',
      element: <Navigate to="/404" replace />,
    },
  ]);

  return routes;
}
