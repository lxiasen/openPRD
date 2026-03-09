import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import NewProjectModal from '../components/NewProjectModal';
import EditProjectModal from '../components/EditProjectModal';
import TemplateLibraryModal from '../components/TemplateLibraryModal';
import EditCheckItemModal from '../components/EditCheckItemModal';
import { projectApi, prdApi, wsService, authApi } from '../services/api';
import '../styles/common.css';

const WorkspacePage = () => {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [projects, setProjects] = useState([]);
  const [editingProject, setEditingProject] = useState(null);
  const [stats, setStats] = useState({
    total_projects: 0,
    in_progress_projects: 0,
    completed_projects: 0,
    weekly_new_projects: 0
  });
  const [loading, setLoading] = useState(false);
  const [statsLoading, setStatsLoading] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [activeTab, setActiveTab] = useState('prd');
  const [prdContent, setPrdContent] = useState('');
  const [checkItems, setCheckItems] = useState([]);
  const [optimizedPrdContent, setOptimizedPrdContent] = useState('');
  const [isQualityChecking, setIsQualityChecking] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [ws, setWs] = useState(null);
  const [notification, setNotification] = useState(null);
  const [user, setUser] = useState(null);
  const [isEditCheckItemModalOpen, setIsEditCheckItemModalOpen] = useState(false);
  const [editingCheckItem, setEditingCheckItem] = useState(null);

  // 获取项目列表
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        const response = await projectApi.getProjects();
        setProjects(response.projects || []);
      } catch (error) {
        console.error('获取项目列表失败:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  // 获取统计数据
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setStatsLoading(true);
        const data = await projectApi.getProjectStats();
        setStats(data);
      } catch (error) {
        console.error('获取统计数据失败:', error);
      } finally {
        setStatsLoading(false);
      }
    };

    fetchStats();
  }, []);

  // 获取用户信息
  useEffect(() => {
    const fetchUserInfo = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        
        console.error('获取用户信息失败1:', error);
        // 没有token，重定向到登录页
        navigate('/login');
        return;
      }
      
      try {
        const userInfo = await authApi.getMe();
        setUser(userInfo);
      } catch (error) {
        console.error('获取用户信息失败2:', error);
        // 获取用户信息失败，重定向到登录页
        localStorage.removeItem('token');
        navigate('/login');
      }
    };

    fetchUserInfo();
  }, [navigate]);

  // WebSocket连接和质量审核结果处理
  useEffect(() => {
    // 处理质量审核结果
    const handleQualityCheckResult = (data) => {
      if (data.type === 'quality_check_result') {
        // 处理质量审核结果
        setIsQualityChecking(false);
        
        if (data.status === 'success') {
          // 更新检查结果
          setCheckItems(data.check_items || []);
          // 显示成功消息
          setNotification({
            type: 'success',
            message: '质量审核完成！'
          });
        } else {
          // 显示错误消息
          setNotification({
            type: 'error',
            message: `质量审核失败：${data.message}`
          });
        }
        // 3秒后自动隐藏通知
        setTimeout(() => {
          setNotification(null);
        }, 3000);
      }
    };

    // 只有在用户存在时才添加监听器，不调用connect（由authStore统一管理）
    if (user) {
      wsService.on('quality_check_result', handleQualityCheckResult);
    }

    return () => {
      // 移除监听器
      wsService.off('quality_check_result', handleQualityCheckResult);
    };
  }, [user]);

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedTemplate(null);
  };

  const handleOpenTemplateModal = () => {
    setIsTemplateModalOpen(true);
  };

  const handleCloseTemplateModal = () => {
    setIsTemplateModalOpen(false);
  };

  const handleUseTemplate = (template) => {
    setSelectedTemplate({
      name: template.name,
      content: template.content
    });
    setIsTemplateModalOpen(false);
    setIsModalOpen(true);
  };



  const handleEditProject = (project) => {
    setEditingProject(project);
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setEditingProject(null);
  };

  const handleUpdateProject = async (projectData) => {
    try {
      setLoading(true);
      await projectApi.updateProject(editingProject.id, projectData);
      
      const response = await projectApi.getProjects();
      setProjects(response.projects || []);
      setIsEditModalOpen(false);
      setEditingProject(null);
      alert('项目更新成功！');
    } catch (error) {
      console.error('更新项目失败:', error);
      alert('更新项目失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProject = async (projectId, projectName) => {
    if (!window.confirm(`确定要删除项目"${projectName}"吗？此操作不可恢复。`)) {
      return;
    }

    try {
      setLoading(true);
      await projectApi.deleteProject(projectId);
      
      const response = await projectApi.getProjects();
      setProjects(response.projects || []);
      alert('项目删除成功！');
    } catch (error) {
      console.error('删除项目失败:', error);
      alert('删除项目失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  // 打开抽屉并获取项目详情
  const handleViewProject = async (projectId) => {
    try {
      setLoading(true);
      // 这里应该调用获取项目详情的API，暂时使用模拟数据
      const project = projects.find(p => p.id === projectId);
      setSelectedProject(project);
      setIsDrawerOpen(true);
      
      // 获取PRD内容
      if (project.prd_original_id) {
        const prdResult = await prdApi.getPRDContent(projectId, project.prd_original_id);
        setPrdContent(prdResult.content || `# ${project.name}\n\n${project.description || '无描述'}`);
      } else {
        setPrdContent(`# ${project.name}\n\n${project.description || '无描述'}`);
      }
      
      // 获取已有的检查项
      try {
        const checkItemsResult = await prdApi.getCheckItems(projectId);
        setCheckItems(checkItemsResult.check_items || []);
      } catch (error) {
        // 如果没有检查项，不报错
        console.log('获取检查项失败，可能是项目还没有进行过质量审核');
        setCheckItems([]);
      }
      
      // 模拟优化后的PRD
      setOptimizedPrdContent('');
    } catch (error) {
      console.error('获取项目详情失败:', error);
      alert('获取项目详情失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  // 关闭抽屉
  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
    setSelectedProject(null);
    setActiveTab('prd');
    setPrdContent('');
    setCheckItems([]);
    setOptimizedPrdContent('');
  };

  // 打开编辑检查项模态框
  const handleEditCheckItem = (checkItem) => {
    setEditingCheckItem(checkItem);
    setIsEditCheckItemModalOpen(true);
  };

  // 关闭编辑检查项模态框
  const handleCloseEditCheckItemModal = () => {
    setIsEditCheckItemModalOpen(false);
    setEditingCheckItem(null);
  };

  // 更新检查项
  const handleUpdateCheckItem = async (checkItemData) => {
    try {
      setLoading(true);
      await prdApi.updateCheckItem(editingCheckItem.id, checkItemData);
      
      // 更新本地检查项列表
      const updatedCheckItems = checkItems.map(item => 
        item.id === editingCheckItem.id ? { ...item, ...checkItemData } : item
      );
      setCheckItems(updatedCheckItems);
      setIsEditCheckItemModalOpen(false);
      setEditingCheckItem(null);
      setNotification({
        type: 'success',
        message: '检查项更新成功！'
      });
      // 3秒后自动隐藏通知
      setTimeout(() => {
        setNotification(null);
      }, 3000);
    } catch (error) {
      console.error('更新检查项失败:', error);
      setNotification({
        type: 'error',
        message: '更新检查项失败，请重试'
      });
      // 3秒后自动隐藏通知
      setTimeout(() => {
        setNotification(null);
      }, 3000);
    } finally {
      setLoading(false);
    }
  };

  // 删除检查项
  const handleDeleteCheckItem = async (checkItemId, checkItemDescription) => {
    if (!window.confirm(`确定要删除检查项"${checkItemDescription}"吗？此操作不可恢复。`)) {
      return;
    }

    try {
      setLoading(true);
      await prdApi.deleteCheckItem(checkItemId);
      
      // 从本地检查项列表中移除
      const updatedCheckItems = checkItems.filter(item => item.id !== checkItemId);
      setCheckItems(updatedCheckItems);
      setNotification({
        type: 'success',
        message: '检查项删除成功！'
      });
      // 3秒后自动隐藏通知
      setTimeout(() => {
        setNotification(null);
      }, 3000);
    } catch (error) {
      console.error('删除检查项失败:', error);
      setNotification({
        type: 'error',
        message: '删除检查项失败，请重试'
      });
      // 3秒后自动隐藏通知
      setTimeout(() => {
        setNotification(null);
      }, 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (projectData) => {
    try {
      setLoading(true);
      
      // 上传PRD内容并创建项目
      const formData = new FormData();
      formData.append('project_name', projectData.name);
      formData.append('description', projectData.description);
      
      if (projectData.importMode === 'paste') {
        // 对于粘贴模式，创建一个临时文件
        const blob = new Blob([projectData.prdContent], { type: 'text/markdown' });
        formData.append('file', blob, 'prd.md');
      } else if (projectData.importMode === 'upload' && projectData.prdContent) {
        // 对于上传模式，直接使用文件
        formData.append('file', projectData.prdContent);
      }
      
      const uploadResult = await prdApi.uploadPRD(formData);
      
      // 如果需要自动质检
      if (projectData.autoCheck && uploadResult.project_id) {
        await prdApi.analyzePRD(uploadResult.project_id);
      }
      
      // 重新获取项目列表
      const response = await projectApi.getProjects();
      setProjects(response.projects || []);
      setIsModalOpen(false);
      // 显示成功提示
      alert('项目创建成功！');
      
    } catch (error) {
      console.error('创建项目失败:', error);
      alert('创建项目失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-content fade-in">
      <h1 className="page-title">工作台</h1>
      <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px', marginBottom: '32px'}}>
        {/* 统计卡片 */}
        <div className="card">
          <div className="flex justify-between items-start">
            <div>
              <p style={{color: '#64748B', fontSize: '14px'}}>总项目数</p>
              <h3 style={{fontSize: '24px', fontWeight: '700', color: '#0F172A', marginTop: '4px'}}>{statsLoading ? '加载中...' : stats.total_projects}</h3>
              <p style={{color: '#10B981', fontSize: '12px', marginTop: '4px'}}>+{stats.weekly_new_projects} 本周</p>
            </div>
            <div style={{width: '40px', height: '40px', backgroundColor: '#E0F2FE', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
              <svg style={{width: '20px', height: '20px', color: '#0891B2'}} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex justify-between items-start">
            <div>
              <p style={{color: '#64748B', fontSize: '14px'}}>进行中项目</p>
              <h3 style={{fontSize: '24px', fontWeight: '700', color: '#0F172A', marginTop: '4px'}}>{statsLoading ? '加载中...' : stats.in_progress_projects}</h3>
              <p style={{color: '#10B981', fontSize: '12px', marginTop: '4px'}}>进行中</p>
            </div>
            <div style={{width: '40px', height: '40px', backgroundColor: '#EFF6FF', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
              <svg style={{width: '20px', height: '20px', color: '#3B82F6'}} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex justify-between items-start">
            <div>
              <p style={{color: '#64748B', fontSize: '14px'}}>已完成项目</p>
              <h3 style={{fontSize: '24px', fontWeight: '700', color: '#0F172A', marginTop: '4px'}}>{statsLoading ? '加载中...' : stats.completed_projects}</h3>
              <p style={{color: '#10B981', fontSize: '12px', marginTop: '4px'}}>已完成</p>
            </div>
            <div style={{width: '40px', height: '40px', backgroundColor: '#DCFCE7', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
              <svg style={{width: '20px', height: '20px', color: '#15803D'}} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>


      </div>

      {/* 最近项目 */}
      <div className="card mb-8" style={{maxWidth: 'none'}}>
        <div className="flex justify-between items-center mb-4">
          <h2 style={{fontSize: '18px', fontWeight: '600', color: '#0F172A'}}>最近项目</h2>
          <div style={{display: 'flex', gap: '12px'}}>
            <button 
              className="btn btn-primary"
              onClick={handleOpenModal}
            >
              <svg style={{width: '16px', height: '16px', marginRight: '6px'}} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              新建PRD质检项目
            </button>
            <button 
              className="btn btn-secondary"
              onClick={handleOpenTemplateModal}
            >
              <svg style={{width: '16px', height: '16px', marginRight: '6px'}} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              查看模板库
            </button>
          </div>
        </div>
        <div>
          <table className="table" style={{width: '100%'}}>
            <thead>
              <tr>
                <th>项目名称</th>
                <th>项目描述</th>
                <th>状态</th>
                <th>创建时间</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" className="text-center py-4">加载中...</td>
                </tr>
              ) : projects.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-4">暂无项目</td>
                </tr>
              ) : (
                projects.map(project => (
                  <tr key={project.id}>
                    <td style={{fontWeight: '500'}}>{project.name}</td>
                    <td style={{maxWidth: '400px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', position: 'relative'}}>
                      <span title={project.description || '无描述'}>
                        {project.description ? (project.description.length > 100 ? project.description.substring(0, 100) + '...' : project.description) : '无描述'}
                      </span>
                    </td>
                    <td>
                      {project.status === 'created' ? (
                        <span className="badge badge-warning">已创建</span>
                      ) : project.status === 'analyzed' ? (
                        <span className="badge badge-info">已质检</span>
                      ) : project.status === 'optimized' ? (
                        <span className="badge badge-success">已优化</span>
                      ) : project.status === 'exported' ? (
                        <span className="badge badge-success">已导出</span>
                      ) : (
                        <span className="badge">{project.status}</span>
                      )}
                    </td>
                    <td>{new Date(project.created_at).toISOString().split('T')[0]}</td>
                    <td>
                      <div className="flex gap-2">
                        <button className="btn-text" onClick={() => handleViewProject(project.id)}>查看</button>
                        <button className="btn-text" onClick={() => handleEditProject(project)}>编辑</button>
                        <button className="btn-text btn-text-danger" onClick={() => handleDeleteProject(project.id, project.name)}>删除</button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 新建项目弹窗 */}
      <NewProjectModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
        initialData={selectedTemplate}
      />

      {/* 模板库弹窗 */}
      <TemplateLibraryModal
        isOpen={isTemplateModalOpen}
        onClose={handleCloseTemplateModal}
        onUseTemplate={handleUseTemplate}
      />

      {/* 编辑项目弹窗 */}
      <EditProjectModal
        isOpen={isEditModalOpen}
        onClose={handleCloseEditModal}
        onSubmit={handleUpdateProject}
        initialData={editingProject}
      />

      {/* 编辑检查项弹窗 */}
      <EditCheckItemModal
        isOpen={isEditCheckItemModalOpen}
        onClose={handleCloseEditCheckItemModal}
        onSubmit={handleUpdateCheckItem}
        initialData={editingCheckItem}
      />

      {/* 项目详情抽屉 */}
      {isDrawerOpen && selectedProject && (
        <div className="drawer-overlay" onClick={handleCloseDrawer}>
          <div className="drawer" onClick={(e) => e.stopPropagation()}>
            <div className="drawer-header">
              <h2 className="drawer-title">{selectedProject.name}</h2>
              <button className="drawer-close" onClick={handleCloseDrawer}>
                ×
              </button>
            </div>
            <div className="drawer-content">
              {/* 页签切换 */}
              <div className="tab-container">
                <button 
                  className={`tab ${activeTab === 'prd' ? 'active' : ''}`}
                  onClick={() => setActiveTab('prd')}
                >
                  PRD信息
                </button>
                <button 
                  className={`tab ${activeTab === 'diff' ? 'active' : ''}`}
                  onClick={() => setActiveTab('diff')}
                >
                  PRD对比
                </button>
              </div>
              {/* 页签内容 */}
              <div className="tab-content">
                {activeTab === 'prd' && (
                  <div className="prd-info">
                    <div className="prd-header">
                      <h3>PRD原文</h3>
                      <div className="prd-actions">
                        <div style={{display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '8px'}}>
                          <button 
                            className="btn btn-secondary"
                            onClick={async () => {
                              if (isQualityChecking) return; // 避免重复调用
                              
                              // 如果已有检查项，弹出确认对话框
                              if (checkItems.length > 0) {
                                if (!window.confirm('已存在质量检查结果，重新检查将覆盖原有结果，确定要继续吗？')) {
                                  return;
                                }
                              }
                              
                              setIsQualityChecking(true);
                              setNotification(null); // 清除之前的通知
                              try {
                                await prdApi.analyzePRD(selectedProject.id);
                                setNotification({
                                  type: 'info',
                                  message: '质量审核已开始，结果将通过通知发送！'
                                });
                                // 2秒后自动隐藏通知
                                setTimeout(() => {
                                  setNotification(null);
                                }, 2000);
                              } catch (error) {
                                console.error('质量审核失败:', error);
                                setNotification({
                                  type: 'error',
                                  message: '质量审核失败，请重试'
                                });
                                // 3秒后自动隐藏通知
                                setTimeout(() => {
                                  setNotification(null);
                                }, 3000);
                                setIsQualityChecking(false);
                              }
                            }}
                          >
                            {isQualityChecking ? '检查中...' : '质量审核'}
                          </button>
                          {notification && (
                            <div style={{
                              padding: '8px 12px',
                              borderRadius: '4px',
                              fontSize: '14px',
                              color: notification.type === 'success' ? '#10B981' : 
                                     notification.type === 'error' ? '#EF4444' : '#3B82F6',
                              backgroundColor: notification.type === 'success' ? '#DCFCE7' : 
                                               notification.type === 'error' ? '#FEE2E2' : '#EFF6FF',
                              border: `1px solid ${notification.type === 'success' ? '#BBF7D0' : 
                                                notification.type === 'error' ? '#FECACA' : '#BFDBFE'}`
                            }}>
                              {notification.message}
                            </div>
                          )}
                        </div>
                        <button 
                          className="btn btn-primary"
                          onClick={async () => {
                            setIsOptimizing(true);
                            try {
                              const optimizeResult = await prdApi.optimizePRD(selectedProject.id);
                              const optimizedPrdContent = await prdApi.getPRDContent(selectedProject.id, optimizeResult.optimized_prd_id);
                              setOptimizedPrdContent(optimizedPrdContent.content || '');
                              setIsOptimizing(false);
                              setActiveTab('diff');
                              setNotification({
                                type: 'success',
                                message: 'PRD优化完成！'
                              });
                              // 3秒后自动隐藏通知
                              setTimeout(() => {
                                setNotification(null);
                              }, 3000);
                            } catch (error) {
                              console.error('PRD优化失败:', error);
                              setNotification({
                                type: 'error',
                                message: 'PRD优化失败，请重试'
                              });
                              // 3秒后自动隐藏通知
                              setTimeout(() => {
                                setNotification(null);
                              }, 3000);
                              setIsOptimizing(false);
                            }
                          }}
                        >
                          {isOptimizing ? '优化中...' : 'PRD优化'}
                        </button>
                      </div>
                    </div>
                    <div className="prd-content">
                      <pre>{prdContent}</pre>
                    </div>
                    {checkItems.length > 0 && (
                      <div className="quality-result">
                        <h3>质量审核结果</h3>
                        <table className="table">
                          <thead>
                            <tr>
                              <th>检查ID</th>
                              <th>问题维度</th>
                              <th>模糊点描述</th>
                              <th>修改建议</th>
                              <th>操作</th>
                            </tr>
                          </thead>
                          <tbody>
                            {checkItems.map(item => (
                              <tr key={item.id}>
                                <td>{item.check_id}</td>
                                <td>{item.dimension}</td>
                                <td>{item.issue_description}</td>
                                <td>{item.suggestion}</td>
                                <td>
                                  <div className="flex gap-2">
                                    <button className="btn-text" onClick={() => handleEditCheckItem(item)}>修改</button>
                                    <button className="btn-text btn-text-danger" onClick={() => handleDeleteCheckItem(item.id, item.issue_description)}>删除</button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}
                {activeTab === 'diff' && (
                  <div className="prd-diff">
                    <div className="diff-header">
                      <h3>PRD对比</h3>
                      <button className="btn btn-secondary"
                        onClick={() => {
                          try {
                            // 使用已有的PRD内容
                            let content = optimizedPrdContent || prdContent;
                            if (!content) {
                              throw new Error('PRD内容不存在');
                            }
                            
                            // 创建下载链接
                            const blob = new Blob([content], { type: 'text/markdown' });
                            const url = window.URL.createObjectURL(blob);
                            const link = document.createElement('a');
                            link.href = url;
                            link.download = `${selectedProject.name}.md`;
                            document.body.appendChild(link);
                            link.click();
                            document.body.removeChild(link);
                            window.URL.revokeObjectURL(url);
                            
                            alert('PRD导出成功！');
                          } catch (error) {
                            console.error('PRD导出失败:', error);
                            alert('PRD导出失败，请重试');
                          }
                        }}
                      >
                        导出
                      </button>
                    </div>
                    <div className="diff-content">
                      <div className="diff-side">
                        <h4>原始PRD</h4>
                        <div className="diff-text">
                          <pre>{prdContent}</pre>
                        </div>
                      </div>
                      <div className="diff-side">
                        <h4>优化后PRD</h4>
                        <div className="diff-text">
                          <pre>{optimizedPrdContent || '暂无优化内容'}</pre>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkspacePage;
