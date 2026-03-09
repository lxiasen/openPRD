import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, FileText, BarChart3, Settings } from 'lucide-react';

const Sidebar = ({ isOpen, user }) => {
  const location = useLocation();

  const navigation = [
    {
      name: '工作台',
      href: '/',
      icon: Home,
      current: location.pathname === '/',
    },
    {
      name: '项目管理',
      href: '/projects',
      icon: FileText,
      current: location.pathname.startsWith('/projects'),
    },
    {
      name: '统计分析',
      href: '/analytics',
      icon: BarChart3,
      current: location.pathname === '/analytics',
    },
    {
      name: '设置',
      href: '/settings',
      icon: Settings,
      current: location.pathname === '/settings',
    },
  ];

  if (!isOpen) {
    return null;
  }

  return (
    <>
      {/* Horizontal Sidebar */}
      <div 
        style={{ 
          position: 'fixed',
          top: '4rem',
          left: 0,
          right: 0,
          zIndex: 40,
          backgroundColor: 'var(--brand-600)', // 使用品牌主题色
          transform: isOpen ? 'translateY(0)' : 'translateY(-100%)',
          transition: 'transform 0.3s ease-in-out',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
          height: '3rem'
        }}
      >
        <div style={{ 
          maxWidth: '1200px',
          margin: '0 auto',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          padding: '0 1rem'
        }}>
          {/* Navigation */}
          <nav style={{ display: 'flex', gap: '1rem' }}>
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.5rem 1rem',
                    borderRadius: '0.375rem',
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    transition: 'all 0.2s ease-in-out',
                    color: item.current ? 'white' : 'rgba(255, 255, 255, 0.8)',
                    backgroundColor: item.current ? 'rgba(255, 255, 255, 0.2)' : 'transparent'
                  }}
                  onMouseEnter={(e) => {
                    if (!item.current) {
                      e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                      e.currentTarget.style.color = 'white';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!item.current) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.color = 'rgba(255, 255, 255, 0.8)';
                    }
                  }}
                >
                  <Icon
                    style={{ width: '1rem', height: '1rem', color: 'white' }}
                  />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </>
  );
};

export default Sidebar;