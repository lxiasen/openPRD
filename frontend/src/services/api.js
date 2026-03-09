// API服务文件，封装与后端的通信
import ErrorHandler from '../utils/errorHandler';

// 直接请求后端服务，避免代理导致的Authorization header丢失
const API_BASE_URL = 'http://localhost:8000/api/v1';
const WS_BASE_URL = 'ws://localhost:8000';

// WebSocket服务
class WebSocketService {
  constructor() {
    this.socket = null;
    this.listeners = {};
  }

  // 建立WebSocket连接
  connect(token) {
    if (!token) {
      console.error('WebSocket连接失败：缺少token');
      return null;
    }

    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      return this.socket;
    }

    this.socket = new WebSocket(`${WS_BASE_URL}/ws/notifications?token=${token}`);

    this.socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        // 通知所有监听器
        if (this.listeners[data.type]) {
          this.listeners[data.type].forEach(callback => callback(data));
        }
        // 通知所有通用监听器
        if (this.listeners['*']) {
          this.listeners['*'].forEach(callback => callback(data));
        }
      } catch (error) {
        console.error('解析WebSocket消息失败:', error);
      }
    };

    this.socket.onopen = () => {
      console.log('WebSocket连接已建立');
    };

    this.socket.onerror = (error) => {
      console.error('WebSocket错误:', error);
    };

    this.socket.onclose = () => {
      console.log('WebSocket连接已关闭');
      // 自动重连
      setTimeout(() => {
        this.connect(token);
      }, 3000);
    };

    return this.socket;
  }

  // 添加消息监听器
  on(type, callback) {
    if (!this.listeners[type]) {
      this.listeners[type] = [];
    }
    this.listeners[type].push(callback);
  }

  // 移除消息监听器
  off(type, callback) {
    if (this.listeners[type]) {
      this.listeners[type] = this.listeners[type].filter(cb => cb !== callback);
    }
  }

  // 发送消息
  send(data) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(data));
    }
  }

  // 获取WebSocket连接
  getSocket() {
    return this.socket;
  }
}

// 导出单例
export const wsService = new WebSocketService();

// 通用请求方法
async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const defaultOptions = {
    headers: {},
  };
  
  // 只有当没有明确设置 Content-Type 且不是 FormData 时，才默认使用 application/json
  if (!options.headers || !options.headers['Content-Type']) {
    if (!(options.body instanceof FormData)) {
      defaultOptions.headers['Content-Type'] = 'application/json';
    }
  }
  
  const token = localStorage.getItem('token');
  if (token) {
    defaultOptions.headers['Authorization'] = `Bearer ${token}`;
  }
  
  const mergedOptions = {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers,
    },
  };
  
  try {
    const response = await fetch(url, mergedOptions);
    
    // 处理空响应
    const contentType = response.headers.get('content-type');
    let responseData = {};
    
    if (contentType && contentType.includes('application/json')) {
      responseData = await response.json();
    }
    
    if (!response.ok) {
      // 处理错误响应
      const errorMessage = ErrorHandler.handleApiError(responseData);
      const error = new Error(errorMessage);
      error.response = { data: responseData };
      error.status = response.status;
      throw error;
    }
    
    return responseData;
  } catch (error) {
    // 处理网络错误等
    console.error('API请求错误:', error);
    throw error;
  }
}

// 认证相关API
export const authApi = {
  // 注册
  register: (userData) => request('/auth/register', {
    method: 'POST',
    body: JSON.stringify(userData),
  }),
  
  // 登录 - 使用application/x-www-form-urlencoded格式
  login: (credentials) => {
    const formData = new URLSearchParams();
    formData.append('username', credentials.username);
    formData.append('password', credentials.password);
    
    return request('/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData,
    });
  },
  
  // 获取用户信息
  getMe: () => request('/auth/me'),
  
  // 密码重置
  resetPassword: (email) => request('/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify({ email }),
  }),
};

// 项目相关API
export const projectApi = {
  // 获取项目列表
  getProjects: () => request('/projects'),
  
  // 获取项目详情
  getProject: (id) => request(`/projects/${id}`),
  
  // 更新项目
  updateProject: (id, projectData) => request(`/projects/${id}`, {
    method: 'PUT',
    body: JSON.stringify(projectData),
  }),
  
  // 删除项目
  deleteProject: (id) => request(`/projects/${id}`, {
    method: 'DELETE',
  }),
  
  // 获取项目统计数据
  getProjectStats: () => request('/projects/stats/summary'),
};

// PRD相关API
export const prdApi = {
  // 上传PRD文件
  uploadPRD: (formData) => request('/prd/upload', {
    method: 'POST',
    headers: {
      // 注意：文件上传不需要Content-Type，浏览器会自动设置
    },
    body: formData,
  }),
  
  // 分析PRD
  analyzePRD: (projectId) => request(`/prd/quality-check/${projectId}`, {
    method: 'POST',
  }),
  
  // 获取检查项列表
  getCheckItems: (projectId) => request(`/prd/check-items/${projectId}`),
  
  // 修改检查项
  updateCheckItem: (checkItemId, data) => request(`/prd/check-items/${checkItemId}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  
  // 删除检查项
  deleteCheckItem: (checkItemId) => request(`/prd/check-items/${checkItemId}`, {
    method: 'DELETE',
  }),

  // 优化PRD
  optimizePRD: (projectId) => request(`/prd/optimize/${projectId}`, {
    method: 'POST',
  }),
  
  // 获取优化结果
  getOptimizationResult: (projectId) => request(`/prd/optimization/${projectId}`),
  
  // 导出PRD
  exportPRD: (projectId, format) => request(`/prd/export/${projectId}?format=${format}`),
  
  // 获取PRD内容
  getPRDContent: (projectId, prdId) => request(`/prd/content/${projectId}/${prdId}`),
};

// 模板库相关API
export const templateApi = {
  // 获取模板列表
  getTemplates: (params = {}) => {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append('page', params.page);
    if (params.page_size) queryParams.append('page_size', params.page_size);
    if (params.category) queryParams.append('category', params.category);
    if (params.keyword) queryParams.append('keyword', params.keyword);
    
    const queryString = queryParams.toString();
    return request(`/templates${queryString ? '?' + queryString : ''}`);
  },
  
  // 搜索模板
  searchTemplates: (params = {}) => {
    const queryParams = new URLSearchParams();
    if (params.keyword) queryParams.append('keyword', params.keyword);
    if (params.category) queryParams.append('category', params.category);
    if (params.tags) params.tags.forEach(tag => queryParams.append('tags', tag));
    if (params.page) queryParams.append('page', params.page);
    if (params.page_size) queryParams.append('page_size', params.page_size);
    
    const queryString = queryParams.toString();
    return request(`/templates/search${queryString ? '?' + queryString : ''}`);
  },
  
  // 获取模板详情
  getTemplate: (templateId) => request(`/templates/${templateId}`),
  
  // 下载模板
  downloadTemplate: (templateId) => request(`/templates/${templateId}/download`),
  
  // 获取模板分类
  getCategories: () => request('/template-categories'),
  
  // 获取模板标签
  getTags: () => request('/template-tags'),
};

// 反馈相关API
export const feedbackApi = {
  // 获取反馈列表
  getFeedbacks: () => request('/feedback'),
  
  // 创建反馈
  createFeedback: (feedbackData) => request('/feedback', {
    method: 'POST',
    body: JSON.stringify(feedbackData),
  }),
  
  // 删除反馈
  deleteFeedback: (feedbackId) => request(`/feedback/${feedbackId}`, {
    method: 'DELETE',
  }),
};

// 通知相关API
export const notificationApi = {
  // 获取通知列表
  getNotifications: (page = 1, pageSize = 20) => request(`/notifications?page=${page}&page_size=${pageSize}`),
  
  // 标记通知为已读
  markAsRead: (notificationId) => request(`/notifications/${notificationId}/read`, {
    method: 'PUT',
  }),
  
  // 删除通知
  deleteNotification: (notificationId) => request(`/notifications/${notificationId}`, {
    method: 'DELETE',
  }),
  
  // 获取通知设置
  getNotificationSettings: () => request('/notifications/settings'),
  
  // 更新通知设置
  updateNotificationSettings: (settings) => request('/notifications/settings', {
    method: 'PUT',
    body: JSON.stringify(settings),
  }),
};
