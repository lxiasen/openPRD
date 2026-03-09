import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authApi, wsService } from '../services/api';

const useAuthStore = create(
  persist(
    (set, get) => ({
      // 状态
      user: null,
      token: null,
      isLoading: false,
      error: null,

      // 登录
      login: async (username, password) => {
        set({ isLoading: true, error: null });
        try {
          // 调用真实的登录API
          const response = await authApi.login({ username, password });
          
          // 保存token到localStorage
          localStorage.setItem('token', response.access_token);
          
          // 获取用户信息
          const userInfo = await authApi.getMe();
          
          // 建立WebSocket连接
          wsService.connect(response.access_token);
          
          set({ user: userInfo, token: response.access_token, isLoading: false });
          return { success: true };
        } catch (error) {
          console.error('登录失败:', error);
          const errorMessage = error.message || '登录失败，请检查用户名和密码';
          set({ error: errorMessage, isLoading: false });
          return { success: false, error: errorMessage };
        }
      },

      // 注册
      register: async (username, email, password) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authApi.register({ username, email, password });
          
          localStorage.setItem('token', response.access_token);
          
          // 建立WebSocket连接
          wsService.connect(response.access_token);
          
          set({ user: response.user, token: response.access_token, isLoading: false });
          return { success: true };
        } catch (error) {
          console.error('注册失败:', error);
          const errorMessage = error.message || '注册失败，请稍后重试';
          set({ error: errorMessage, isLoading: false });
          return { success: false, error: errorMessage };
        }
      },

      // 登出
  logout: () => {
    localStorage.removeItem('token');
    // 断开WebSocket连接
    wsService.disconnect();
    set({ user: null, token: null, error: null });
  },

      // 清除错误
      clearError: () => {
        set({ error: null });
      },

      // 初始化时检查token并获取用户信息
      initAuth: async () => {
        const token = localStorage.getItem('token');
        if (token) {
          try {
            const userInfo = await authApi.getMe();
            // 建立WebSocket连接
            wsService.connect(token);
            set({ user: userInfo, token: token });
          } catch (error) {
            console.error('验证token失败:', error);
            localStorage.removeItem('token');
            set({ user: null, token: null });
          }
        }
      },
    }),
    {
      name: 'auth-storage', // 存储在localStorage中的键名
    }
  )
);

export { useAuthStore };
