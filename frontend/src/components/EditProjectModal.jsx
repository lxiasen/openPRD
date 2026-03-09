import React, { useState, useEffect } from 'react';
import '../styles/common.css';

const EditProjectModal = ({ isOpen, onClose, onSubmit, initialData }) => {
  const [projectName, setProjectName] = useState('');
  const [description, setDescription] = useState('');
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setProjectName(initialData.name || '');
      setDescription(initialData.description || '');
    }
  }, [initialData]);

  useEffect(() => {
    if (isOpen && initialData) {
      setProjectName(initialData.name || '');
      setDescription(initialData.description || '');
    }
  }, [isOpen, initialData]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!projectName.trim()) {
      newErrors.projectName = '项目名称不能为空';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit({
        name: projectName,
        description: description
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal">
        {/* 弹窗头部 */}
        <div className="modal-header" style={{ padding: '0 0 16px 0', borderBottom: '1px solid #E2E8F0' }}>
          <h2 className="modal-title" style={{ fontSize: '20px' }}>编辑项目</h2>
          <button
            onClick={onClose}
            className="modal-close"
            style={{ 
              color: '#64748B', 
              cursor: 'pointer', 
              padding: '4px', 
              borderRadius: '4px', 
              transition: 'color 0.2s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            onMouseEnter={(e) => e.target.style.color = '#334155'}
            onMouseLeave={(e) => e.target.style.color = '#64748B'}
          >
            <svg style={{ width: '24px', height: '24px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* 弹窗内容 */}
        <div style={{ padding: '24px 0' }}>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '24px' }}>
              <label className="form-label">
                项目名称 <span style={{ color: '#EF4444' }}>*</span>
              </label>
              <input
                type="text"
                value={projectName}
                onChange={(e) => {
                  setProjectName(e.target.value);
                  setErrors(prev => ({ ...prev, projectName: '' }));
                }}
                placeholder="请输入项目名称"
                className={`form-input ${errors.projectName ? 'error' : ''}`}
                style={{ padding: '10px 16px' }}
              />
              {errors.projectName && (
                <p className="error-text">{errors.projectName}</p>
              )}
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label className="form-label">
                项目描述
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="请输入项目描述"
                rows={3}
                style={{
                  width: '100%',
                  padding: '10px 16px',
                  border: `1px solid #E2E8F0`,
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontFamily: 'inherit',
                  resize: 'vertical'
                }}
              />
            </div>

            {/* 操作按钮 */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '16px', paddingTop: '16px', borderTop: '1px solid #E2E8F0' }}>
              <button
                type="button"
                onClick={onClose}
                className="btn btn-secondary"
              >
                取消
              </button>
              <button
                type="submit"
                className="btn btn-primary"
              >
                保存
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditProjectModal;
