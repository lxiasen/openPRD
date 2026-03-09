import React, { useEffect } from 'react'
import { RouterProvider } from 'react-router-dom'
import router from './router'
import './App.css'
import { useAuthStore } from './store/authStore'

function App() {
  const initAuth = useAuthStore(state => state.initAuth);

  useEffect(() => {
    // 初始化认证状态
    initAuth();
  }, [initAuth]);

  return (
    <RouterProvider router={router} />
  )
}

export default App
