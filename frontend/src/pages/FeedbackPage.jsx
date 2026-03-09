import React, { useState, useEffect } from 'react';
import { feedbackApi } from '../services/api';
import '../styles/common.css';

const FeedbackPage = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    type: 'suggestion',
    title: '',
    content: '',
    contact: ''
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  const fetchFeedbacks = async () => {
    try {
      setLoading(true);
      const response = await feedbackApi.getFeedbacks();
      setFeedbacks(response.feedbacks || []);
    } catch (error) {
      console.error('获取反馈列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = '标题不能为空';
    }
    
    if (!formData.content.trim()) {
      newErrors.content = '内容不能为空';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      await feedbackApi.createFeedback(formData);
      
      setIsModalOpen(false);
      setFormData({
        type: 'suggestion',
        title: '',
        content: '',
        contact: ''
      });
      fetchFeedbacks();
      alert('提交成功！感谢您的反馈。');
    } catch (error) {
      console.error('提交反馈失败:', error);
      alert('提交失败，请重试');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('确定要删除这条反馈吗？')) {
      return;
    }

    try {
      await feedbackApi.deleteFeedback(id);
      fetchFeedbacks();
      alert('删除成功');
    } catch (error) {
      console.error('删除反馈失败:', error);
      alert('删除失败，请重试');
    }
  };

  const getTypeBadge = (type) => {
    const typeMap = {
      'suggestion': { text: '建议', className: 'badge-info' },
      'bug': { text: 'Bug', className: 'badge-danger' },
      'feature': { text: '功能需求', className: 'badge-success' },
      'other': { text: '其他', className: 'badge-warning' }
    };
    return typeMap[type] || typeMap['other'];
  };

  return (
    <div className="page-content fade-in">
      <h1 className="page-title">建议反馈</h1>
      
      <div className="card mb-6" style={{maxWidth: 'none'}}>
        <div className="flex justify-between items-center mb-4">
          <div>
            <p style={{color: '#64748B', fontSize: '14px', marginBottom: '4px'}}>
              我们非常重视您的意见和建议，您的反馈将帮助我们改进产品。
            </p>
          </div>
          <button 
            className="btn btn-primary"
            onClick={() => setIsModalOpen(true)}
          >
            提交反馈
          </button>
        </div>
      </div>

      <div className="card" style={{maxWidth: 'none', padding: 0}}>
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>类型</th>
                <th>标题</th>
                <th>内容</th>
                <th>联系方式</th>
                <th>提交时间</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="text-center py-4">加载中...</td>
                </tr>
              ) : feedbacks.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-4">暂无反馈</td>
                </tr>
              ) : (
                feedbacks.map(feedback => (
                  <tr key={feedback.id}>
                    <td>
                      <span className={`badge ${getTypeBadge(feedback.type).className}`}>
                        {getTypeBadge(feedback.type).text}
                      </span>
                    </td>
                    <td style={{fontWeight: '500'}}>{feedback.title}</td>
                    <td style={{maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>
                      {feedback.content}
                    </td>
                    <td>{feedback.contact || '-'}</td>
                    <td>{new Date(feedback.created_at).toLocaleString('zh-CN')}</td>
                    <td>
                      <button 
                        className="btn-text btn-text-danger"
                        onClick={() => handleDelete(feedback.id)}
                      >
                        删除
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 提交反馈弹窗 */}
      {isModalOpen && (
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
            borderRadius: '8px',
            padding: '24px',
            width: '90%',
            maxWidth: '600px',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '16px'
            }}>
              <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#0F172A', margin: 0 }}>
                提交反馈
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: '#64748B',
                  padding: 0,
                  lineHeight: 1
                }}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#334155',
                  marginBottom: '4px'
                }}>
                  反馈类型
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({...formData, type: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #CBD5E1',
                    borderRadius: '6px',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                >
                  <option value="suggestion">建议</option>
                  <option value="bug">Bug</option>
                  <option value="feature">功能需求</option>
                  <option value="other">其他</option>
                </select>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#334155',
                  marginBottom: '4px'
                }}>
                  标题 <span style={{ color: '#EF4444' }}>*</span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => {
                    setFormData({...formData, title: e.target.value});
                    setErrors({...errors, title: ''});
                  }}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: errors.title ? '1px solid #EF4444' : '1px solid #CBD5E1',
                    borderRadius: '6px',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                  placeholder="请输入标题"
                />
                {errors.title && (
                  <div style={{ color: '#EF4444', fontSize: '12px', marginTop: '4px' }}>
                    {errors.title}
                  </div>
                )}
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#334155',
                  marginBottom: '4px'
                }}>
                  内容 <span style={{ color: '#EF4444' }}>*</span>
                </label>
                <textarea
                  value={formData.content}
                  onChange={(e) => {
                    setFormData({...formData, content: e.target.value});
                    setErrors({...errors, content: ''});
                  }}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: errors.content ? '1px solid #EF4444' : '1px solid #CBD5E1',
                    borderRadius: '6px',
                    fontSize: '14px',
                    minHeight: '150px',
                    resize: 'vertical',
                    boxSizing: 'border-box',
                    fontFamily: 'inherit'
                  }}
                  placeholder="请详细描述您的建议或问题..."
                />
                {errors.content && (
                  <div style={{ color: '#EF4444', fontSize: '12px', marginTop: '4px' }}>
                    {errors.content}
                  </div>
                )}
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#334155',
                  marginBottom: '4px'
                }}>
                  联系方式（选填）
                </label>
                <input
                  type="text"
                  value={formData.contact}
                  onChange={(e) => setFormData({...formData, contact: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #CBD5E1',
                    borderRadius: '6px',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                  placeholder="邮箱或手机号"
                />
              </div>

              <div style={{
                display: 'flex',
                gap: '12px',
                justifyContent: 'flex-end'
              }}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  style={{
                    padding: '8px 16px',
                    border: '1px solid #CBD5E1',
                    borderRadius: '6px',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#334155',
                    background: 'white',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseOver={(e) => e.target.style.backgroundColor = '#F1F5F9'}
                  onMouseOut={(e) => e.target.style.backgroundColor = 'white'}
                >
                  取消
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '8px 16px',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: 'white',
                    background: '#0891B2',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseOver={(e) => e.target.style.backgroundColor = '#0E7490'}
                  onMouseOut={(e) => e.target.style.backgroundColor = '#0891B2'}
                >
                  提交
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FeedbackPage;
