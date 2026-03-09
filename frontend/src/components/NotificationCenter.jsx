import React, { useState, useEffect } from 'react';
import { notificationApi } from '../services/api';

const NotificationCenter = ({ isOpen, onClose }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await notificationApi.getNotifications();
      setNotifications(response.notifications || []);
      setUnreadCount(response.notifications.filter(n => !n.is_read).length);
    } catch (error) {
      console.error('获取通知失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await notificationApi.markAsRead(notificationId);
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
      );
      setUnreadCount(prev => prev - 1);
    } catch (error) {
      console.error('标记已读失败:', error);
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      await notificationApi.deleteNotification(notificationId);
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
    } catch (error) {
      console.error('删除通知失败:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="notification-overlay" style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      zIndex: 1000,
      opacity: isOpen ? 1 : 0,
      transition: 'opacity 0.3s ease-in-out'
    }} onClick={onClose}>
      <div className="notification-center" style={{
        position: 'fixed',
        top: 0,
        right: 0,
        bottom: 0,
        width: '90%',
        maxWidth: '400px',
        backgroundColor: 'white',
        boxShadow: '-2px 0 8px rgba(0, 0, 0, 0.1)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
        transition: 'transform 0.3s ease-in-out',
        zIndex: 1001
      }} onClick={(e) => e.stopPropagation()}>
        <div className="notification-header" style={{
          padding: '16px',
          borderBottom: '1px solid #E2E8F0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h2 style={{ fontSize: '18px', fontWeight: '600', margin: 0 }}>
            通知中心
            {unreadCount > 0 && (
              <span style={{
                marginLeft: '8px',
                padding: '2px 8px',
                backgroundColor: '#EF4444',
                color: 'white',
                borderRadius: '10px',
                fontSize: '12px'
              }}>
                {unreadCount}
              </span>
            )}
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              color: '#64748B'
            }}
          >
            ×
          </button>
        </div>
        <div className="notification-list" style={{
          flex: 1,
          overflowY: 'auto',
          padding: '16px'
        }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <p>加载中...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#64748B' }}>
              <p>暂无通知</p>
            </div>
          ) : (
            notifications.map(notification => (
              <div
                key={notification.id}
                style={{
                  padding: '12px',
                  border: '1px solid #E2E8F0',
                  borderRadius: '6px',
                  marginBottom: '8px',
                  backgroundColor: notification.is_read ? 'white' : '#FEF3C7'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <h3 style={{ fontSize: '14px', fontWeight: '600', margin: 0 }}>
                    {notification.title}
                  </h3>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {!notification.is_read && (
                      <button
                        onClick={() => markAsRead(notification.id)}
                        style={{
                          background: 'none',
                          border: '1px solid #E2E8F0',
                          borderRadius: '4px',
                          padding: '4px 8px',
                          fontSize: '12px',
                          cursor: 'pointer'
                        }}
                      >
                        标记已读
                      </button>
                    )}
                    <button
                      onClick={() => deleteNotification(notification.id)}
                      style={{
                        background: 'none',
                        border: '1px solid #E2E8F0',
                        borderRadius: '4px',
                        padding: '4px 8px',
                        fontSize: '12px',
                        cursor: 'pointer',
                        color: '#EF4444'
                      }}
                    >
                      删除
                    </button>
                  </div>
                </div>
                <p style={{ fontSize: '14px', color: '#64748B', marginTop: '4px' }}>
                  {notification.content}
                </p>
                <p style={{ fontSize: '12px', color: '#94A3B8', marginTop: '4px' }}>
                  {new Date(notification.created_at).toLocaleString()}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationCenter;