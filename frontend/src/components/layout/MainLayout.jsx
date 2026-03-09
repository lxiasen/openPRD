import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import { useAuthStore } from '../../store/authStore';

const MainLayout = () => {
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="min-h-screen bg-primary-50 flex flex-col">
      {/* Header */}
      <Header
        user={user}
        onLogout={handleLogout}
      />

      {/* Main Content */}
      <main className="pt-16 flex-1">
        <div className="container py-6">
          <Outlet />
        </div>
      </main>

    </div>
  );
};

export default MainLayout;
