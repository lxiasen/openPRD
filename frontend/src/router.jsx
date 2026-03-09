import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import MainLayout from './components/layout/MainLayout';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import WorkspacePage from './pages/WorkspacePage';
import FeedbackPage from './pages/FeedbackPage';
import ProjectDetailPage from './pages/ProjectDetailPage';

import { useAuthStore } from './store/authStore';

// 认证路由保护组件
const ProtectedRoute = ({ children }) => {
  const { user } = useAuthStore();
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

// 公共路由保护组件（已登录用户不能访问登录/注册页）
const PublicRoute = ({ children }) => {
  const { user } = useAuthStore();
  
  if (user) {
    return <Navigate to="/" replace />;
  }
  
  return children;
};

// 路由配置
const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <MainLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        path: '/',
        element: <WorkspacePage />,
      },
      {
        path: '/feedback',
        element: <FeedbackPage />,
      },
      {
        path: '/projects/:id',
        element: <ProjectDetailPage />,
      },
    ],
  },
  {
    path: '/login',
    element: (
      <PublicRoute>
        <LoginPage />
      </PublicRoute>
    ),
  },
  {
    path: '/register',
    element: (
      <PublicRoute>
        <RegisterPage />
      </PublicRoute>
    ),
  },
  {
    path: '/forgot-password',
    element: (
      <PublicRoute>
        <ForgotPasswordPage />
      </PublicRoute>
    ),
  },
  // 404页面
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);

export default router;