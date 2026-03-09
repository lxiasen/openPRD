import React, { useState, useRef, useEffect } from 'react';

const NewProjectModal = ({ isOpen, onClose, onSubmit, initialData }) => {
  const [activeTab, setActiveTab] = useState('paste');
  const [projectName, setProjectName] = useState('');
  const [description, setDescription] = useState('');
  const [prdContent, setPrdContent] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [errors, setErrors] = useState({});
  const fileInputRef = useRef(null);

  // 当initialData变化时，自动填充表单
  useEffect(() => {
    if (initialData) {
      if (initialData.name) {
        setProjectName(initialData.name);
      }
      if (initialData.description) {
        setDescription(initialData.description);
      }
      if (initialData.content) {
        setPrdContent(initialData.content);
        setActiveTab('paste');
      }
    }
  }, [initialData]);

  // 当弹窗打开时，如果有initialData，填充表单
  useEffect(() => {
    if (isOpen && initialData) {
      if (initialData.name) {
        setProjectName(initialData.name);
      }
      if (initialData.description) {
        setDescription(initialData.description);
      }
      if (initialData.content) {
        setPrdContent(initialData.content);
        setActiveTab('paste');
      }
    }
  }, [isOpen, initialData]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!projectName.trim()) {
      newErrors.projectName = '项目名称不能为空';
    }
    
    if (activeTab === 'paste' && !prdContent.trim()) {
      newErrors.prdContent = 'PRD内容不能为空';
    }
    
    if (activeTab === 'upload' && !selectedFile) {
      newErrors.selectedFile = '请选择PRD文件';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit({
        name: projectName,
        description: description,
        prdContent: activeTab === 'paste' ? prdContent : selectedFile,
        importMode: activeTab
      });
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setErrors(prev => ({ ...prev, selectedFile: '' }));
    }
  };

  const handlePaste = (e) => {
    if (activeTab === 'paste') {
      const text = e.clipboardData.getData('text');
      if (text) {
        setPrdContent(prev => prev + text);
        setErrors(prev => ({ ...prev, prdContent: '' }));
      }
    }
  };

  const handleCreateAndCheck = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit({
        name: projectName,
        description: description,
        prdContent: activeTab === 'paste' ? prdContent : selectedFile,
        importMode: activeTab,
        autoCheck: true
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" style={{ zIndex: 9999 }}>
      <div className="modal" style={{ maxWidth: '800px' }}>
        {/* 弹窗头部 */}
        <div className="modal-header" style={{ padding: '0 0 16px 0', borderBottom: '1px solid #E2E8F0' }}>
          <h2 className="modal-title" style={{ fontSize: '20px' }}>新建PRD质检项目</h2>
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
          {/* 项目名称 */}
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

          {/* 项目描述 */}
          <div style={{ marginBottom: '24px' }}>
            <label className="form-label">
              项目描述
            </label>
            <textarea
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                setErrors(prev => ({ ...prev, description: '' }));
              }}
              placeholder="请输入项目描述"
              rows={3}
              style={{
                width: '100%',
                padding: '10px 16px',
                border: `1px solid ${errors.description ? '#EF4444' : '#E2E8F0'}`,
                borderRadius: '6px',
                fontSize: '14px',
                fontFamily: 'inherit',
                resize: 'vertical'
              }}
            />
            {errors.description && (
              <p className="error-text">{errors.description}</p>
            )}
          </div>

          {/* 导入模式切换 */}
          <div style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', borderBottom: '1px solid #E2E8F0', marginBottom: '16px' }}>
              <button
                onClick={() => setActiveTab('paste')}
                style={{
                  flex: 1,
                  padding: '12px 16px',
                  textAlign: 'center',
                  fontWeight: '500',
                  fontSize: '14px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  borderBottom: activeTab === 'paste' ? '2px solid #8B4513' : 'none',
                  color: activeTab === 'paste' ? '#8B4513' : '#64748B',
                  background: 'none',
                  border: 'none'
                }}
                onMouseEnter={(e) => {
                  if (activeTab !== 'paste') {
                    e.target.style.color = '#475569';
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeTab !== 'paste') {
                    e.target.style.color = '#64748B';
                  }
                }}
              >
                粘贴Markdown
              </button>
              <button
                onClick={() => setActiveTab('upload')}
                style={{
                  flex: 1,
                  padding: '12px 16px',
                  textAlign: 'center',
                  fontWeight: '500',
                  fontSize: '14px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  borderBottom: activeTab === 'upload' ? '2px solid #8B4513' : 'none',
                  color: activeTab === 'upload' ? '#8B4513' : '#64748B',
                  background: 'none',
                  border: 'none'
                }}
                onMouseEnter={(e) => {
                  if (activeTab !== 'upload') {
                    e.target.style.color = '#475569';
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeTab !== 'upload') {
                    e.target.style.color = '#64748B';
                  }
                }}
              >
                上传文件
              </button>
            </div>

            {/* 粘贴模式 */}
            {activeTab === 'paste' && (
              <div>
                <label className="form-label">
                  PRD内容 <span style={{ color: '#EF4444' }}>*</span>
                </label>
                <textarea
                  value={prdContent}
                  onChange={(e) => {
                    setPrdContent(e.target.value);
                    setErrors(prev => ({ ...prev, prdContent: '' }));
                  }}
                  onPaste={handlePaste}
                  placeholder="请粘贴PRD的Markdown内容"
                  rows={10}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: `1px solid ${errors.prdContent ? '#EF4444' : '#E2E8F0'}`,
                    borderRadius: '6px',
                    fontSize: '14px',
                    fontFamily: 'inherit',
                    resize: 'vertical'
                  }}
                />
                {errors.prdContent && (
                  <p className="error-text">{errors.prdContent}</p>
                )}
                <p style={{ color: '#64748B', fontSize: '12px', marginTop: '8px' }}>
                  支持Markdown格式，可直接粘贴PRD原文
                </p>
              </div>
            )}

            {/* 上传模式 */}
            {activeTab === 'upload' && (
              <div>
                <label className="form-label">
                  选择PRD文件 <span style={{ color: '#EF4444' }}>*</span>
                </label>
                <div style={{ border: '2px dashed #E2E8F0', borderRadius: '8px', padding: '32px', textAlign: 'center', transition: 'border-color 0.2s', cursor: 'pointer' }}
                     onClick={() => fileInputRef.current.click()}
                     onMouseEnter={(e) => e.currentTarget.style.borderColor = '#8B4513'}
                     onMouseLeave={(e) => e.currentTarget.style.borderColor = '#E2E8F0'}>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".md,.txt,.markdown"
                    onChange={handleFileChange}
                    style={{ display: 'none' }}
                  />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      fileInputRef.current.click();
                    }}
                    className="btn btn-secondary"
                  >
                    选择文件
                  </button>
                  <p style={{ color: '#64748B', fontSize: '12px' }}>
                    支持 .md, .txt, .markdown 格式文件
                  </p>
                  {selectedFile && (
                    <div style={{ marginTop: '16px', padding: '12px', backgroundColor: '#F8FAFC', borderRadius: '6px' }}>
                      <p style={{ fontSize: '14px', fontWeight: '500', color: '#334155' }}>
                        已选择：{selectedFile.name}
                      </p>
                      <p style={{ color: '#64748B', fontSize: '12px' }}>
                        文件大小：{(selectedFile.size / 1024).toFixed(2)} KB
                      </p>
                    </div>
                  )}
                  {errors.selectedFile && (
                    <p className="error-text">{errors.selectedFile}</p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* 操作按钮 */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '16px', paddingTop: '16px', borderTop: '1px solid #E2E8F0' }}>
            <button
              onClick={onClose}
              className="btn btn-secondary"
            >
              取消
            </button>
            <button
              onClick={handleSubmit}
              className="btn btn-primary"
            >
              创建项目
            </button>
            <button
              onClick={handleCreateAndCheck}
              className="btn btn-primary"
            >
              创建并一键质检
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewProjectModal;
