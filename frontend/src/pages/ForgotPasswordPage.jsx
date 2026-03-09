import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { authApi } from '../services/api';
import '../styles/common.css';

const ForgotPasswordPage = () => {
  const [formData, setFormData] = useState({
    email: '',
  });
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const { isLoading, error } = useAuthStore();
  const navigate = useNavigate();

  const validateForm = () => {
    const newErrors = {};
    if (!formData.email.trim()) {
      newErrors.email = '请输入邮箱';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = '请输入有效的邮箱地址';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      try {
        await authApi.forgotPassword(formData.email);
        setSuccessMessage('重置密码链接已发送到您的邮箱，请查收');
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } catch (error) {
        setErrors({ submit: '发送失败，请稍后重试' });
      }
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    // 清除对应字段的错误
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  return (
    <div className="page-container">
      <div className="card">
        <div className="page-header text-center mb-6">
          <h1 className="page-title mb-2">忘记密码</h1>
          <p className="text-sm text-primary-500 mb-2">专业PRD质量审核与优化平台</p>
          <p className="page-subtitle">请输入您的邮箱，我们将发送重置密码链接</p>
        </div>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {successMessage && (
          <div className="success-message">
            {successMessage}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group mb-6">
            <label htmlFor="email" className="form-label">
              邮箱 <span style={{ color: '#EF4444' }}>*</span>
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`form-input ${errors.email ? 'error' : ''}`}
              placeholder="请输入邮箱"
              autoComplete="email"
            />
            {errors.email && (
              <p className="error-text">{errors.email}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="btn btn-primary btn-full"
          >
            {isLoading ? (
              <div className="loading-spinner">
                <div className="spinner"></div>
                <span>发送中...</span>
              </div>
            ) : (
              '发送重置链接'
            )}
          </button>

          <div className="mt-6 text-center">
            <p className="page-subtitle">
              想起密码了?{' '}
              <Link to="/login" className="link">
                立即登录
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
