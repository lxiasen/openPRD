import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { authApi, notificationApi } from '../services/api';

const SettingsModal = ({ isOpen, onClose, activeTab = 'profile' }) => {
  const { user, logout } = useAuthStore();
  const [currentTab, setCurrentTab] = useState(activeTab);

  useEffect(() => {
    setCurrentTab(activeTab);
  }, [activeTab]);
  const [profileForm, setProfileForm] = useState({
    bio: '',
  });
  const [securityForm, setSecurityForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [notificationSettings, setNotificationSettings] = useState({
    quality_check_notification: true,
  });
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingSettings, setIsLoadingSettings] = useState(false);

  // 获取通知设置
  useEffect(() => {
    const fetchNotificationSettings = async () => {
      if (currentTab === 'notifications' && user) {
        try {
          setIsLoadingSettings(true);
          const response = await notificationApi.getNotificationSettings();
          setNotificationSettings(response);
        } catch (error) {
          console.error('获取通知设置失败:', error);
        } finally {
          setIsLoadingSettings(false);
        }
      }
    };

    fetchNotificationSettings();
  }, [currentTab, user]);

  const tabs = [
    { id: 'profile', name: '个人信息' },
    { id: 'security', name: '安全设置' },
    { id: 'notifications', name: '通知设置' },
  ];

  if (!isOpen) return null;

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileForm(prev => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const handleSecurityChange = (e) => {
    const { name, value } = e.target;
    setSecurityForm(prev => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const validateSecurityForm = () => {
    const newErrors = {};
    if (!securityForm.currentPassword) {
      newErrors.currentPassword = '请输入当前密码';
    }
    if (!securityForm.newPassword) {
      newErrors.newPassword = '请输入新密码';
    } else if (securityForm.newPassword.length < 6) {
      newErrors.newPassword = '新密码至少6个字符';
    }
    if (!securityForm.confirmPassword) {
      newErrors.confirmPassword = '请确认新密码';
    } else if (securityForm.confirmPassword !== securityForm.newPassword) {
      newErrors.confirmPassword = '两次输入的密码不一致';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setSuccessMessage('');
    try {
      await authApi.updateMe({ bio: profileForm.bio });
      setSuccessMessage('个人信息更新成功');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      setErrors({ submit: '更新失败，请稍后重试' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSecuritySubmit = async (e) => {
    e.preventDefault();
    if (validateSecurityForm()) {
      setIsLoading(true);
      setSuccessMessage('');
      try {
        await authApi.changePassword({
          current_password: securityForm.currentPassword,
          new_password: securityForm.newPassword,
        });
        setSuccessMessage('密码修改成功');
        setSecurityForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
        setTimeout(() => setSuccessMessage(''), 3000);
      } catch (error) {
        setErrors({ submit: '修改失败，请检查当前密码是否正确' });
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '0.5rem',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        width: '90%',
        maxWidth: '600px',
        maxHeight: '90vh',
        overflow: 'auto'
      }}>
        {/* Modal Header */}
        <div style={{
          padding: '1rem',
          borderBottom: '1px solid var(--primary-200)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--primary-900)' }}>设置</h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '1.5rem',
              cursor: 'pointer',
              color: 'var(--primary-500)'
            }}
          >
            ×
          </button>
        </div>

        {/* Modal Content */}
        <div style={{ padding: '1rem' }}>
          {/* Tabs */}
          <div style={{ display: 'flex', borderBottom: '1px solid var(--primary-200)', marginBottom: '1rem' }}>
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setCurrentTab(tab.id)}
                style={{
                  padding: '0.5rem 1rem',
                  border: 'none',
                  background: 'none',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  color: currentTab === tab.id ? 'var(--brand-600)' : 'var(--primary-600)',
                  borderBottom: currentTab === tab.id ? '2px solid var(--brand-600)' : '2px solid transparent',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                {tab.name}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          {currentTab === 'profile' && (
            <div>
              {successMessage && (
                <div style={{ marginBottom: '1rem', padding: '0.75rem', backgroundColor: 'var(--bg-success)', color: 'var(--success)', borderRadius: '0.375rem' }}>
                  {successMessage}
                </div>
              )}
              {errors.submit && (
                <div style={{ marginBottom: '1rem', padding: '0.75rem', backgroundColor: 'var(--bg-danger)', color: 'var(--danger)', borderRadius: '0.375rem' }}>
                  {errors.submit}
                </div>
              )}
              <form onSubmit={handleProfileSubmit}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                  <div>
                    <label htmlFor="username" style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: 'var(--primary-700)', marginBottom: '0.25rem' }}>
                      用户名
                    </label>
                    <input
                      type="text"
                      id="username"
                      value={user?.username || ''}
                      disabled
                      style={{ width: '100%', padding: '0.5rem', border: '1px solid var(--primary-300)', borderRadius: '0.375rem', backgroundColor: 'var(--primary-50)' }}
                    />
                  </div>
                  <div>
                    <label htmlFor="email" style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: 'var(--primary-700)', marginBottom: '0.25rem' }}>
                      邮箱
                    </label>
                    <input
                      type="email"
                      id="email"
                      value={user?.email || ''}
                      disabled
                      style={{ width: '100%', padding: '0.5rem', border: '1px solid var(--primary-300)', borderRadius: '0.375rem', backgroundColor: 'var(--primary-50)' }}
                    />
                  </div>
                </div>
                <div style={{ marginBottom: '1rem' }}>
                  <label htmlFor="bio" style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: 'var(--primary-700)', marginBottom: '0.25rem' }}>
                    个人简介
                  </label>
                  <textarea
                    id="bio"
                    name="bio"
                    rows={4}
                    value={profileForm.bio}
                    onChange={handleProfileChange}
                    placeholder="请输入个人简介"
                    style={{ width: '100%', padding: '0.5rem', border: '1px solid var(--primary-300)', borderRadius: '0.375rem', resize: 'vertical' }}
                  ></textarea>
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                  <button type="button" onClick={onClose} style={{
                    padding: '0.5rem 1rem',
                    border: '1px solid var(--primary-300)',
                    borderRadius: '0.375rem',
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    color: 'var(--primary-700)',
                    backgroundColor: 'white',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}>
                    取消
                  </button>
                  <button type="submit" disabled={isLoading} style={{
                    padding: '0.5rem 1rem',
                    border: 'none',
                    borderRadius: '0.375rem',
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    color: 'white',
                    backgroundColor: 'var(--brand-600)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}>
                    {isLoading ? '保存中...' : '保存'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {currentTab === 'security' && (
            <div>
              {successMessage && (
                <div style={{ marginBottom: '1rem', padding: '0.75rem', backgroundColor: 'var(--bg-success)', color: 'var(--success)', borderRadius: '0.375rem' }}>
                  {successMessage}
                </div>
              )}
              {errors.submit && (
                <div style={{ marginBottom: '1rem', padding: '0.75rem', backgroundColor: 'var(--bg-danger)', color: 'var(--danger)', borderRadius: '0.375rem' }}>
                  {errors.submit}
                </div>
              )}
              <form onSubmit={handleSecuritySubmit}>
                <div style={{ marginBottom: '1rem' }}>
                  <label htmlFor="current-password" style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: 'var(--primary-700)', marginBottom: '0.25rem' }}>
                    当前密码 <span style={{ color: 'var(--danger)' }}>*</span>
                  </label>
                  <input
                    type="password"
                    id="current-password"
                    name="currentPassword"
                    autocomplete="current-password"
                    value={securityForm.currentPassword}
                    onChange={handleSecurityChange}
                    placeholder="请输入当前密码"
                    style={{ width: '100%', padding: '0.5rem', border: `1px solid ${errors.currentPassword ? 'var(--danger)' : 'var(--primary-300)'}`, borderRadius: '0.375rem' }}
                  />
                  {errors.currentPassword && (
                    <p style={{ marginTop: '0.25rem', fontSize: '0.75rem', color: 'var(--danger)' }}>{errors.currentPassword}</p>
                  )}
                </div>
                <div style={{ marginBottom: '1rem' }}>
                  <label htmlFor="new-password" style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: 'var(--primary-700)', marginBottom: '0.25rem' }}>
                    新密码 <span style={{ color: 'var(--danger)' }}>*</span>
                  </label>
                  <input
                    type="password"
                    id="new-password"
                    name="newPassword"
                    autocomplete="new-password"
                    value={securityForm.newPassword}
                    onChange={handleSecurityChange}
                    placeholder="请输入新密码"
                    style={{ width: '100%', padding: '0.5rem', border: `1px solid ${errors.newPassword ? 'var(--danger)' : 'var(--primary-300)'}`, borderRadius: '0.375rem' }}
                  />
                  {errors.newPassword && (
                    <p style={{ marginTop: '0.25rem', fontSize: '0.75rem', color: 'var(--danger)' }}>{errors.newPassword}</p>
                  )}
                </div>
                <div style={{ marginBottom: '1rem' }}>
                  <label htmlFor="confirm-password" style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: 'var(--primary-700)', marginBottom: '0.25rem' }}>
                    确认新密码 <span style={{ color: 'var(--danger)' }}>*</span>
                  </label>
                  <input
                    type="password"
                    id="confirm-password"
                    name="confirmPassword"
                    autocomplete="new-password"
                    value={securityForm.confirmPassword}
                    onChange={handleSecurityChange}
                    placeholder="请确认新密码"
                    style={{ width: '100%', padding: '0.5rem', border: `1px solid ${errors.confirmPassword ? 'var(--danger)' : 'var(--primary-300)'}`, borderRadius: '0.375rem' }}
                  />
                  {errors.confirmPassword && (
                    <p style={{ marginTop: '0.25rem', fontSize: '0.75rem', color: 'var(--danger)' }}>{errors.confirmPassword}</p>
                  )}
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                  <button type="button" onClick={onClose} style={{
                    padding: '0.5rem 1rem',
                    border: '1px solid var(--primary-300)',
                    borderRadius: '0.375rem',
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    color: 'var(--primary-700)',
                    backgroundColor: 'white',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}>
                    取消
                  </button>
                  <button type="submit" disabled={isLoading} style={{
                    padding: '0.5rem 1rem',
                    border: 'none',
                    borderRadius: '0.375rem',
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    color: 'white',
                    backgroundColor: 'var(--brand-600)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}>
                    {isLoading ? '保存中...' : '保存'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {currentTab === 'notifications' && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: 'var(--primary-700)', marginBottom: '0.25rem' }}>
                    质检完成通知
                  </label>
                  <p style={{ fontSize: '0.75rem', color: 'var(--primary-500)' }}>接收质检完成的通知</p>
                </div>
                <button 
                  onClick={async () => {
                    try {
                      setIsLoadingSettings(true);
                      const newSetting = {
                        quality_check_notification: !notificationSettings.quality_check_notification
                      };
                      const response = await notificationApi.updateNotificationSettings(newSetting);
                      setNotificationSettings(response);
                      setSuccessMessage('通知设置已更新');
                      setTimeout(() => setSuccessMessage(''), 3000);
                    } catch (error) {
                      console.error('更新通知设置失败:', error);
                      setErrors({ submit: '更新失败，请稍后重试' });
                    } finally {
                      setIsLoadingSettings(false);
                    }
                  }}
                  disabled={isLoadingSettings}
                  style={{
                    width: '2.5rem', 
                    height: '1.5rem', 
                    backgroundColor: notificationSettings.quality_check_notification ? 'var(--brand-600)' : 'var(--primary-300)', 
                    borderRadius: '0.75rem', 
                    position: 'relative', 
                    cursor: 'pointer',
                    border: 'none'
                  }}
                >
                  <div style={{
                    position: 'absolute', 
                    top: '0.125rem', 
                    left: '0.125rem', 
                    width: '1.25rem', 
                    height: '1.25rem', 
                    backgroundColor: 'white', 
                    borderRadius: '50%', 
                    transition: 'transform 0.2s ease', 
                    transform: notificationSettings.quality_check_notification ? 'translateX(1rem)' : 'translateX(0)'
                  }}></div>
                </button>
              </div>
              {successMessage && (
                <div style={{ marginBottom: '1rem', padding: '0.75rem', backgroundColor: 'var(--bg-success)', color: 'var(--success)', borderRadius: '0.375rem' }}>
                  {successMessage}
                </div>
              )}
              {errors.submit && (
                <div style={{ marginBottom: '1rem', padding: '0.75rem', backgroundColor: 'var(--bg-danger)', color: 'var(--danger)', borderRadius: '0.375rem' }}>
                  {errors.submit}
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button onClick={onClose} style={{
                  padding: '0.5rem 1rem',
                  border: '1px solid var(--primary-300)',
                  borderRadius: '0.375rem',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  color: 'var(--primary-700)',
                  backgroundColor: 'white',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}>
                  关闭
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;