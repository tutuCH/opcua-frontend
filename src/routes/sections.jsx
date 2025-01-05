// src/sections.jsx
import { lazy, Suspense } from 'react';
import { Outlet, Navigate, useRoutes } from 'react-router-dom';

import DashboardLayout from 'src/layouts/dashboard';
import AuthMiddleware from 'src/components/AuthMiddleware';

export const IndexPage = lazy(() => import('src/pages/app'));
export const BlogPage = lazy(() => import('src/pages/blog'));
export const MachinePage = lazy(() => import('src/pages/machine'));
export const UserPage = lazy(() => import('src/pages/user'));
export const LoginPage = lazy(() => import('src/pages/login'));
export const SignupPage = lazy(() => import('src/pages/signup'));
export const SettingsPage = lazy(() => import('src/pages/settings'));
export const ForgetPasswordPage = lazy(() => import('src/pages/forgotPassword'));
export const ProductsPage = lazy(() => import('src/pages/products'));
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
        { element: <IndexPage />, index: true },
        { path: 'user', element: <UserPage /> },
        { path: 'products', element: <ProductsPage /> },
        { path: 'blog', element: <BlogPage /> },
        { path: 'machine', element: <MachinePage /> },
        { path: 'settings', element: <SettingsPage /> },
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
