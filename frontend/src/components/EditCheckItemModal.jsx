import React, { useState, useEffect } from 'react';

const EditCheckItemModal = ({ isOpen, onClose, onSubmit, initialData }) => {
  const [formData, setFormData] = useState({
    dimension: '',
    issue_description: '',
    customer_question: '',
    required_info: '',
    suggestion: ''
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        dimension: initialData.dimension || '',
        issue_description: initialData.issue_description || '',
        customer_question: initialData.customer_question || '',
        required_info: initialData.required_info || '',
        suggestion: initialData.suggestion || ''
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
        {/* 弹窗头部 */}
        <div className="modal-header" style={{ padding: '0 0 16px 0', borderBottom: '1px solid #E2E8F0' }}>
          <h2 className="modal-title" style={{ fontSize: '20px' }}>编辑检查项</h2>
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
              justifyContent: 'center',
              background: 'none',
              border: 'none',
              fontSize: '24px'
            }}
            onMouseEnter={(e) => e.target.style.color = '#334155'}
            onMouseLeave={(e) => e.target.style.color = '#64748B'}
          >
            ×
          </button>
        </div>

        {/* 弹窗内容 */}
        <div style={{ padding: '24px 0' }}>
          <form onSubmit={handleSubmit}>
            {/* 问题维度 */}
            <div style={{ marginBottom: '24px' }}>
              <label className="form-label">
                问题维度 <span style={{ color: '#EF4444' }}>*</span>
              </label>
              <input
                type="text"
                id="dimension"
                name="dimension"
                value={formData.dimension}
                onChange={handleChange}
                required
                placeholder="请输入问题维度"
                className="form-input"
                style={{ padding: '10px 16px' }}
              />
            </div>

            {/* 模糊点描述 */}
            <div style={{ marginBottom: '24px' }}>
              <label className="form-label">
                模糊点描述 <span style={{ color: '#EF4444' }}>*</span>
              </label>
              <textarea
                id="issue_description"
                name="issue_description"
                value={formData.issue_description}
                onChange={handleChange}
                required
                placeholder="请输入模糊点描述"
                rows={3}
                style={{
                  width: '100%',
                  padding: '10px 16px',
                  border: '1px solid #E2E8F0',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontFamily: 'inherit',
                  resize: 'vertical'
                }}
              />
            </div>

            {/* 客户提问 */}
            <div style={{ marginBottom: '24px' }}>
              <label className="form-label">
                客户提问 <span style={{ color: '#EF4444' }}>*</span>
              </label>
              <textarea
                id="customer_question"
                name="customer_question"
                value={formData.customer_question}
                onChange={handleChange}
                required
                placeholder="请输入客户提问"
                rows={3}
                style={{
                  width: '100%',
                  padding: '10px 16px',
                  border: '1px solid #E2E8F0',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontFamily: 'inherit',
                  resize: 'vertical'
                }}
              />
            </div>

            {/* 需补充明确的内容 */}
            <div style={{ marginBottom: '24px' }}>
              <label className="form-label">
                需补充明确的内容 <span style={{ color: '#EF4444' }}>*</span>
              </label>
              <textarea
                id="required_info"
                name="required_info"
                value={formData.required_info}
                onChange={handleChange}
                required
                placeholder="请输入需补充明确的内容"
                rows={3}
                style={{
                  width: '100%',
                  padding: '10px 16px',
                  border: '1px solid #E2E8F0',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontFamily: 'inherit',
                  resize: 'vertical'
                }}
              />
            </div>

            {/* 修改建议 */}
            <div style={{ marginBottom: '24px' }}>
              <label className="form-label">
                修改建议 <span style={{ color: '#EF4444' }}>*</span>
              </label>
              <textarea
                id="suggestion"
                name="suggestion"
                value={formData.suggestion}
                onChange={handleChange}
                required
                placeholder="请输入修改建议"
                rows={3}
                style={{
                  width: '100%',
                  padding: '10px 16px',
                  border: '1px solid #E2E8F0',
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

export default EditCheckItemModal;