import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { User, LogOut, Home, MessageSquare, Settings, ChevronDown, UserCircle, Shield, Bell } from 'lucide-react';
import SettingsModal from '../SettingsModal';
import NotificationCenter from '../NotificationCenter';
import { notificationApi, wsService } from '../../services/api';

const Header = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [activeSettingsTab, setActiveSettingsTab] = useState('profile');
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const menuCloseTimeoutRef = React.useRef(null);

  const handleMouseEnter = () => {
    if (menuCloseTimeoutRef.current) {
      clearTimeout(menuCloseTimeoutRef.current);
      menuCloseTimeoutRef.current = null;
    }
    setIsUserMenuOpen(true);
  };

  const handleMouseLeave = () => {
    menuCloseTimeoutRef.current = setTimeout(() => {
      setIsUserMenuOpen(false);
    }, 150);
  };

  const navigation = [
    {
      name: '工作台',
      href: '/',
      icon: Home,
      current: location.pathname === '/',
    },
    {
      name: '建议反馈',
      href: '/feedback',
      icon: MessageSquare,
      current: location.pathname === '/feedback',
    },
  ];

  const handleLogout = () => {
    onLogout();
    navigate('/login');
    setIsUserMenuOpen(false);
  };

  const handleOpenSettings = (tab) => {
    setActiveSettingsTab(tab);
    setIsSettingsModalOpen(true);
    setIsUserMenuOpen(false);
  };

  const handleCloseSettings = () => {
    setIsSettingsModalOpen(false);
  };

  // 获取未读通知数量 + WebSocket实时通知
  useEffect(() => {
    // 初始加载未读数量
    const fetchUnreadCount = async () => {
      if (user) {
        try {
          const response = await notificationApi.getNotifications();
          const count = response.notifications.filter(n => !n.is_read).length;
          setUnreadCount(count);
        } catch (error) {
          console.error('获取未读通知失败:', error);
        }
      }
    };

    // 处理WebSocket消息
    const handleWebSocketMessage = (data) => {
      if (data.type === 'connected') {
        console.log('WebSocket认证成功');
      } else if (data.type === 'new_notification') {
        // 收到新通知，增加未读数量
        setUnreadCount(prev => prev + 1);
        // 可以选择显示浏览器通知
        if (Notification.permission === 'granted') {
          new Notification('新通知', {
            body: data.notification.content,
            icon: '/favicon.ico'
          });
        }
      } else if (data.type === 'unread_count') {
        setUnreadCount(data.count);
      }
    };

    if (user) {
      fetchUnreadCount();
      // 连接WebSocket并添加监听器
      const token = localStorage.getItem('token');
      if (token) {
        wsService.connect(token);
        wsService.on('*', handleWebSocketMessage);
      }
    }

    // 请求浏览器通知权限
    if (user && 'Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    return () => {
      // 移除监听器
      wsService.off('*', handleWebSocketMessage);
    };
  }, [user]);

  return (
    <>
      <header style={{ 
        height: '4rem', 
        backgroundColor: 'white', 
        borderBottom: '1px solid var(--primary-200)', 
        position: 'fixed', 
        top: 0, 
        left: 0, 
        right: 0, 
        zIndex: 30 
      }}>
        <div style={{ 
          maxWidth: '1200px', 
          margin: '0 auto', 
          height: '100%', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          padding: '0 1rem'
        }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <span style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--primary-900)' }}>openPRD</span>
                </div>
                <span style={{ fontSize: '0.75rem', color: 'var(--primary-500)' }}>专业PRD质量审核与优化平台</span>
              </div>
            </Link>
          </div>

          {/* Navigation Menu */}
          <nav style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
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
                    color: item.current ? 'var(--brand-600)' : 'var(--primary-600)',
                    backgroundColor: item.current ? 'var(--brand-50)' : 'transparent'
                  }}
                  onMouseEnter={(e) => {
                    if (!item.current) {
                      e.currentTarget.style.backgroundColor = 'var(--primary-50)';
                      e.currentTarget.style.color = 'var(--primary-900)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!item.current) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.color = 'var(--primary-600)';
                    }
                  }}
                >
                  <Icon
                    style={{ width: '1rem', height: '1rem', color: item.current ? 'var(--brand-600)' : 'var(--primary-400)' }}
                  />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* User Menu */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {user && (
              <button
                onClick={() => setIsNotificationsOpen(true)}
                style={{
                  position: 'relative',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '8px',
                  borderRadius: '4px',
                  transition: 'background-color 0.2s ease-in-out'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--primary-50)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <Bell style={{ width: '1.25rem', height: '1.25rem', color: 'var(--primary-500)' }} />
                {unreadCount > 0 && (
                  <span style={{
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    backgroundColor: '#EF4444',
                    color: 'white',
                    borderRadius: '50%',
                    width: '16px',
                    height: '16px',
                    fontSize: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {unreadCount}
                  </span>
                )}
              </button>
            )}
            {user ? (
              <div style={{ position: 'relative' }} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
                <div 
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.25rem 0.5rem',
                    borderRadius: '0.375rem',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s ease-in-out'
                  }}
                >
                  <div style={{ 
                    width: '2rem', 
                    height: '2rem', 
                    backgroundColor: 'var(--brand-100)', 
                    borderRadius: '9999px', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center' 
                  }}>
                    <User style={{ width: '1rem', height: '1rem', color: 'var(--brand-600)' }} />
                  </div>
                  <span style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--primary-700)' }}>{user.username}</span>
                  <ChevronDown style={{ width: '0.75rem', height: '0.75rem', color: 'var(--primary-500)' }} />
                </div>
                
                {/* User Dropdown Menu */}
                {isUserMenuOpen && (
                  <div 
                    style={{
                      position: 'absolute',
                      top: '100%',
                      right: 0,
                      marginTop: '0.25rem',
                      backgroundColor: 'white',
                      borderRadius: '0.375rem',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                      minWidth: '12rem',
                      zIndex: 100
                    }}
                  >
                    <div style={{ padding: '0.5rem 0' }}>
                      <button
                        onClick={() => handleOpenSettings('profile')}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          width: '100%',
                          padding: '0.5rem 1rem',
                          textAlign: 'left',
                          border: 'none',
                          backgroundColor: 'transparent',
                          fontSize: '0.875rem',
                          fontWeight: 500,
                          color: 'var(--primary-700)',
                          cursor: 'pointer',
                          transition: 'background-color 0.2s ease-in-out'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = 'var(--primary-50)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent';
                        }}
                      >
                        <UserCircle style={{ width: '1rem', height: '1rem', color: 'var(--primary-500)' }} />
                        <span>个人信息</span>
                      </button>
                      <button
                        onClick={() => handleOpenSettings('security')}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          width: '100%',
                          padding: '0.5rem 1rem',
                          textAlign: 'left',
                          border: 'none',
                          backgroundColor: 'transparent',
                          fontSize: '0.875rem',
                          fontWeight: 500,
                          color: 'var(--primary-700)',
                          cursor: 'pointer',
                          transition: 'background-color 0.2s ease-in-out'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = 'var(--primary-50)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent';
                        }}
                      >
                        <Shield style={{ width: '1rem', height: '1rem', color: 'var(--primary-500)' }} />
                        <span>安全设置</span>
                      </button>
                      <button
                        onClick={() => handleOpenSettings('notifications')}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          width: '100%',
                          padding: '0.5rem 1rem',
                          textAlign: 'left',
                          border: 'none',
                          backgroundColor: 'transparent',
                          fontSize: '0.875rem',
                          fontWeight: 500,
                          color: 'var(--primary-700)',
                          cursor: 'pointer',
                          transition: 'background-color 0.2s ease-in-out'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = 'var(--primary-50)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent';
                        }}
                      >
                        <Bell style={{ width: '1rem', height: '1rem', color: 'var(--primary-500)' }} />
                        <span>通知设置</span>
                      </button>
                      <div style={{ height: '1px', backgroundColor: 'var(--primary-200)', margin: '0.5rem 0' }}></div>
                      <button
                        onClick={handleLogout}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          width: '100%',
                          padding: '0.5rem 1rem',
                          textAlign: 'left',
                          border: 'none',
                          backgroundColor: 'transparent',
                          fontSize: '0.875rem',
                          fontWeight: 500,
                          color: 'var(--text-danger-700)',
                          cursor: 'pointer',
                          transition: 'background-color 0.2s ease-in-out'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = 'var(--bg-danger-100)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent';
                        }}
                      >
                        <LogOut style={{ width: '1rem', height: '1rem' }} />
                        <span>退出</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <Link to="/login" style={{ 
                  fontSize: '0.875rem', 
                  color: 'var(--primary-600)', 
                  transition: 'color 0.2s ease-in-out'
                }} 
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = 'var(--brand-600)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = 'var(--primary-600)';
                }}>
                  登录
                </Link>
                <Link to="/register" style={{ 
                  fontSize: '0.875rem', 
                  color: 'var(--primary-600)', 
                  transition: 'color 0.2s ease-in-out'
                }} 
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = 'var(--brand-600)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = 'var(--primary-600)';
                }}>
                  注册
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={handleCloseSettings}
        activeTab={activeSettingsTab}
      />
      
      {/* Notification Center */}
      <NotificationCenter
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
      />
    </>
  );
};

export default Header;