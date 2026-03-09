import React, { useEffect } from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { useAuthStore } from './store/authStore.js'

// 应用初始化组件
const AppWithInit = () => {
  // 初始化认证状态和WebSocket连接
  useEffect(() => {
    const initAuth = useAuthStore.getState().initAuth;
    initAuth();
  }, []);

  return <App />;
};

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AppWithInit />
  </React.StrictMode>,
)