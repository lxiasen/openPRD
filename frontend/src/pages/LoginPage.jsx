import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import '../styles/common.css';

const LoginPage = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [errors, setErrors] = useState({});
  const { login, isLoading, error } = useAuthStore();
  const navigate = useNavigate();

  const validateForm = () => {
    const newErrors = {};
    if (!formData.username.trim()) {
      newErrors.username = '请输入用户名';
    }
    if (!formData.password) {
      newErrors.password = '请输入密码';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      const result = await login(formData.username, formData.password);
      if (result.success) {
        navigate('/');
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
          <h1 className="page-title mb-2">请登录</h1>
          <p className="text-sm text-primary-500">专业PRD质量审核与优化平台</p>
        </div>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">
              用户名 <span style={{ color: '#EF4444' }}>*</span>
            </label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className={`form-input ${errors.username ? 'error' : ''}`}
              placeholder="用户名"
              autoComplete="username"
            />
            {errors.username && (
              <p className="error-text">{errors.username}</p>
            )}
          </div>

          <div className="form-group mb-6">
            <label className="form-label">
              密码 <span style={{ color: '#EF4444' }}>*</span>
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={`form-input ${errors.password ? 'error' : ''}`}
              placeholder="密码"
              autoComplete="current-password"
            />
            {errors.password && (
              <p className="error-text">{errors.password}</p>
            )}
          </div>

          <div className="form-actions mb-4">
            <div>
              <Link
                to="/forgot-password"
                className="link"
              >
                忘记密码?
              </Link>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="btn btn-primary btn-full mb-6"
          >
            {isLoading ? (
              <div className="loading-spinner">
                <div className="spinner"></div>
                <span>登录中...</span>
              </div>
            ) : (
              '登录'
            )}
          </button>

          <div className="text-center">
            <p className="page-subtitle">
              还没有账号?{' '}
              <Link
                to="/register"
                className="link"
              >
                立即注册
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;