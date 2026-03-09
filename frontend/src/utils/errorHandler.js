// 错误处理工具

class ErrorHandler {
  // 错误码映射到用户友好的提示信息
  static errorMessages = {
    // 认证相关错误
    '200101': '用户名或密码错误',
    '200102': '登录已过期，请重新登录',
    '200103': '无效的认证令牌',
    '200104': '权限不足',
    '200201': '用户名已被注册，请更换用户名',
    '200202': '邮箱已被注册，请直接登录',
    '200203': '密码强度不足',
    '200204': '用户名格式不正确',
    '200205': '邮箱格式不正确',
    '200301': '当前密码不正确',
    '200302': '新密码不能与旧密码相同',
    '200303': '密码重置链接已失效',
    '200304': '密码重置链接已过期',
    
    // 用户相关错误
    '300001': '用户不存在',
    '300002': '用户信息更新失败',
    
    // 项目相关错误
    '400001': '项目不存在',
    '400002': '项目创建失败',
    '400003': '项目更新失败',
    '400004': '项目删除失败',
    '400005': '无权访问该项目',
    '400006': '项目名称已存在',
    '400007': '项目名称不能为空',
    
    // PRD相关错误
    '500001': 'PRD文档不存在',
    '500002': 'PRD上传失败',
    '500003': 'PRD解析失败',
    '500004': 'PRD内容不能为空',
    '500005': 'PRD文件过大',
    '500006': '不支持的文件类型',
    '500007': 'PRD优化失败',
    '500008': 'PRD导出失败',
    '500009': 'PRD版本不存在',
    
    // AI/LLM相关错误
    '600001': 'AI服务调用失败，请稍后重试',
    '600002': 'AI服务响应超时',
    '600003': 'AI服务请求过于频繁',
    '600004': '内容被AI安全过滤器拦截',
    
    // 系统错误
    '100001': '未知错误',
    '100002': '系统内部错误，请稍后重试',
    '100003': '数据库操作失败',
    '100004': '参数错误，请检查输入',
    '100005': '请求过于频繁，请稍后再试',
    '100006': '服务暂不可用',
  };

  // 处理API响应错误
  static handleApiError(errorData) {
    if (errorData && typeof errorData === 'object') {
      const { code, message } = errorData;
      
      if (code) {
        return this.errorMessages[code] || message || '操作失败';
      }
      
      if (message) {
        return message;
      }
    }
    
    return '操作失败';
  }

  // 处理网络错误
  static handleNetworkError(error) {
    console.error('网络错误:', error);
    
    if (error.message) {
      if (error.message.includes('NetworkError')) {
        return '网络连接失败，请检查网络设置';
      }
      if (error.message.includes('timeout')) {
        return '请求超时，请稍后重试';
      }
      return error.message;
    }
    
    return '网络连接失败，请检查网络设置';
  }

  // 处理通用错误
  static handleError(error) {
    if (error.response) {
      // 服务器返回错误
      return this.handleApiError(error.response.data);
    } else if (error.request) {
      // 请求已发送但没有收到响应
      return this.handleNetworkError(error);
    } else {
      // 其他错误
      return error.message || '操作失败';
    }
  }
}

export default ErrorHandler;
