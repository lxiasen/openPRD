import React, { useState, useEffect } from 'react';
import { templateApi } from '../services/api';
import MDEditor from '@uiw/react-md-editor';

const TemplateLibraryModal = ({ isOpen, onClose, onUseTemplate }) => {
  const [templates, setTemplates] = useState([]);
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [viewMode, setViewMode] = useState('list'); // 'list' | 'detail'
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const pageSize = 10;

  // 获取模板列表
  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const params = {
        page,
        page_size: pageSize,
      };
      if (selectedCategory) params.category = selectedCategory;
      if (searchKeyword) params.keyword = searchKeyword;
      
      const response = await templateApi.getTemplates(params);
      setTemplates(response.templates || []);
      setTotal(response.total || 0);
    } catch (error) {
      console.error('获取模板列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 获取分类和标签
  const fetchCategoriesAndTags = async () => {
    try {
      const [categoriesRes, tagsRes] = await Promise.all([
        templateApi.getCategories(),
        templateApi.getTags()
      ]);
      setCategories(categoriesRes.categories || []);
      setTags(tagsRes.tags || []);
    } catch (error) {
      console.error('获取分类和标签失败:', error);
    }
  };

  // 查看模板详情
  const handleViewTemplate = async (template) => {
    try {
      setLoading(true);
      const detail = await templateApi.getTemplate(template.id);
      setSelectedTemplate(detail);
      setViewMode('detail');
    } catch (error) {
      console.error('获取模板详情失败:', error);
      alert('获取模板详情失败');
    } finally {
      setLoading(false);
    }
  };

  // 下载模板
  const handleDownloadTemplate = async (template) => {
    try {
      const result = await templateApi.downloadTemplate(template.id);
      
      // 创建下载链接
      const blob = new Blob([result.content], { type: 'text/markdown' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = result.file_name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      // 更新下载次数
      setTemplates(prev => prev.map(t => 
        t.id === template.id ? { ...t, download_count: result.download_count } : t
      ));
    } catch (error) {
      console.error('下载模板失败:', error);
      alert('下载模板失败');
    }
  };

  // 使用模板
  const handleUseTemplate = () => {
    if (selectedTemplate && onUseTemplate) {
      onUseTemplate(selectedTemplate);
      handleClose();
    }
  };

  // 关闭弹窗
  const handleClose = () => {
    setViewMode('list');
    setSelectedTemplate(null);
    setSearchKeyword('');
    setSelectedCategory('');
    setPage(1);
    onClose();
  };

  // 搜索
  const handleSearch = () => {
    setPage(1);
    fetchTemplates();
  };

  // 分类筛选
  const handleCategoryChange = (category) => {
    setSelectedCategory(category === selectedCategory ? '' : category);
    setPage(1);
  };

  // 返回列表
  const handleBackToList = () => {
    setViewMode('list');
    setSelectedTemplate(null);
  };

  // 初始化加载
  useEffect(() => {
    if (isOpen) {
      fetchCategoriesAndTags();
      fetchTemplates();
    }
  }, [isOpen]);

  // 筛选条件变化时重新加载
  useEffect(() => {
    if (isOpen) {
      fetchTemplates();
    }
  }, [selectedCategory, page]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" style={{ zIndex: 10000 }}>
      <div className="modal" style={{ maxWidth: '900px', maxHeight: '85vh', overflow: 'hidden' }}>
        {/* 弹窗头部 */}
        <div className="modal-header" style={{ padding: '0 0 16px 0', borderBottom: '1px solid #E2E8F0' }}>
          <h2 className="modal-title" style={{ fontSize: '20px' }}>
            {viewMode === 'detail' ? '模板详情' : 'PRD模板库'}
          </h2>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            {viewMode === 'detail' && (
              <button
                onClick={handleBackToList}
                style={{
                  padding: '6px 12px',
                  border: '1px solid #E2E8F0',
                  borderRadius: '6px',
                  backgroundColor: 'white',
                  color: '#475569',
                  fontSize: '14px',
                  cursor: 'pointer'
                }}
              >
                返回列表
              </button>
            )}
            <button
              onClick={handleClose}
              className="modal-close"
              style={{ 
                color: '#64748B', 
                cursor: 'pointer', 
                padding: '4px', 
                borderRadius: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <svg style={{ width: '24px', height: '24px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* 弹窗内容 */}
        <div style={{ padding: '20px 0', overflowY: 'auto', maxHeight: 'calc(85vh - 140px)' }}>
          {viewMode === 'list' ? (
            <>
              {/* 搜索和筛选区域 */}
              <div style={{ marginBottom: '20px' }}>
                {/* 搜索框 */}
                <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
                  <div style={{ flex: 1, position: 'relative' }}>
                    <input
                      type="text"
                      value={searchKeyword}
                      onChange={(e) => setSearchKeyword(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                      placeholder="搜索模板名称、描述或标签..."
                      style={{
                        width: '100%',
                        padding: '10px 16px 10px 40px',
                        border: '1px solid #E2E8F0',
                        borderRadius: '6px',
                        fontSize: '14px'
                      }}
                    />
                    <svg 
                      style={{ 
                        position: 'absolute', 
                        left: '12px', 
                        top: '50%', 
                        transform: 'translateY(-50%)',
                        width: '18px',
                        height: '18px',
                        color: '#94A3B8'
                      }} 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <button
                    onClick={handleSearch}
                    className="btn btn-primary"
                  >
                    搜索
                  </button>
                </div>

                {/* 分类筛选 */}
                {categories.length > 0 && (
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                    <span style={{ fontSize: '14px', color: '#64748B' }}>分类：</span>
                    <button
                      onClick={() => handleCategoryChange('')}
                      style={{
                        padding: '4px 12px',
                        borderRadius: '9999px',
                        fontSize: '13px',
                        border: '1px solid ' + (selectedCategory === '' ? '#8B4513' : '#E2E8F0'),
                        backgroundColor: selectedCategory === '' ? '#F6F0E0' : 'white',
                        color: selectedCategory === '' ? '#8B4513' : '#475569',
                        cursor: 'pointer'
                      }}
                    >
                      全部
                    </button>
                    {categories.map(cat => (
                      <button
                        key={cat.id}
                        onClick={() => handleCategoryChange(cat.name)}
                        style={{
                          padding: '4px 12px',
                          borderRadius: '9999px',
                          fontSize: '13px',
                          border: '1px solid ' + (selectedCategory === cat.name ? '#8B4513' : '#E2E8F0'),
                          backgroundColor: selectedCategory === cat.name ? '#F6F0E0' : 'white',
                          color: selectedCategory === cat.name ? '#8B4513' : '#475569',
                          cursor: 'pointer'
                        }}
                      >
                        {cat.name} ({cat.count})
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* 模板列表 */}
              {loading ? (
                <div style={{ textAlign: 'center', padding: '40px' }}>
                  <div className="spinner" style={{ margin: '0 auto' }}></div>
                  <p style={{ marginTop: '12px', color: '#64748B' }}>加载中...</p>
                </div>
              ) : templates.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px' }}>
                  <svg style={{ width: '48px', height: '48px', color: '#CBD5E1', marginBottom: '12px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p style={{ color: '#64748B' }}>暂无模板</p>
                </div>
              ) : (
                <>
                  <div style={{ display: 'grid', gap: '12px' }}>
                    {templates.map(template => (
                      <div
                        key={template.id}
                        style={{
                          padding: '16px',
                          border: '1px solid #E2E8F0',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          backgroundColor: 'white'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderColor = '#8B4513';
                          e.currentTarget.style.boxShadow = '0 2px 8px rgba(139, 69, 19, 0.1)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor = '#E2E8F0';
                          e.currentTarget.style.boxShadow = 'none';
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                          <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#0F172A' }}>
                            {template.name}
                          </h3>
                          <span style={{
                            padding: '2px 8px',
                            backgroundColor: '#F6F0E0',
                            color: '#8B4513',
                            borderRadius: '4px',
                            fontSize: '12px'
                          }}>
                            {template.category}
                          </span>
                        </div>
                        <p style={{ fontSize: '14px', color: '#64748B', marginBottom: '12px', lineHeight: '1.5' }}>
                          {template.description}
                        </p>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                            {template.tags.map((tag, idx) => (
                              <span
                                key={idx}
                                style={{
                                  padding: '2px 8px',
                                  backgroundColor: '#F1F5F9',
                                  color: '#475569',
                                  borderRadius: '4px',
                                  fontSize: '12px'
                                }}
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            <span style={{ fontSize: '12px', color: '#94A3B8' }}>
                              <svg style={{ width: '14px', height: '14px', verticalAlign: 'middle', marginRight: '4px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                              </svg>
                              {template.download_count}
                            </span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleViewTemplate(template);
                              }}
                              className="btn btn-outline"
                              style={{ padding: '4px 12px', fontSize: '13px' }}
                            >
                              查看
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDownloadTemplate(template);
                              }}
                              className="btn btn-secondary"
                              style={{ padding: '4px 12px', fontSize: '13px' }}
                            >
                              下载
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* 分页 */}
                  {total > pageSize && (
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '12px', marginTop: '20px' }}>
                      <button
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="btn btn-secondary"
                        style={{ padding: '6px 12px', fontSize: '13px' }}
                      >
                        上一页
                      </button>
                      <span style={{ fontSize: '14px', color: '#64748B' }}>
                        第 {page} 页，共 {Math.ceil(total / pageSize)} 页
                      </span>
                      <button
                        onClick={() => setPage(p => p + 1)}
                        disabled={page >= Math.ceil(total / pageSize)}
                        className="btn btn-secondary"
                        style={{ padding: '6px 12px', fontSize: '13px' }}
                      >
                        下一页
                      </button>
                    </div>
                  )}
                </>
              )}
            </>
          ) : (
            /* 模板详情视图 */
            selectedTemplate && (
              <div>
                <div style={{ marginBottom: '20px', padding: '16px', backgroundColor: '#F8FAFC', borderRadius: '8px' }}>
                  <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#0F172A', marginBottom: '8px' }}>
                    {selectedTemplate.name}
                  </h3>
                  <p style={{ fontSize: '14px', color: '#64748B', marginBottom: '12px' }}>
                    {selectedTemplate.description}
                  </p>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '12px' }}>
                    {selectedTemplate.tags.map((tag, idx) => (
                      <span
                        key={idx}
                        style={{
                          padding: '2px 8px',
                          backgroundColor: '#F6F0E0',
                          color: '#8B4513',
                          borderRadius: '4px',
                          fontSize: '12px'
                        }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div style={{ display: 'flex', gap: '16px', fontSize: '13px', color: '#94A3B8' }}>
                    <span>分类：{selectedTemplate.category}</span>
                    <span>下载次数：{selectedTemplate.download_count}</span>
                    <span>更新时间：{new Date(selectedTemplate.updated_at).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* 模板内容预览 */}
                <div style={{ marginTop: '24px' }}>
                  <div
                    style={{
                      padding: '20px',
                      backgroundColor: '#FFFFFF',
                      border: '1px solid #E2E8F0',
                      borderRadius: '8px',
                      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)'
                    }}
                  >
                    <MDEditor.Markdown source={selectedTemplate.content} />
                  </div>
                </div>

                {/* 操作按钮 */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '32px' }}>
                  <button
                    onClick={() => handleDownloadTemplate(selectedTemplate)}
                    className="btn btn-secondary"
                  >
                    <svg style={{ width: '16px', height: '16px', marginRight: '6px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    下载模板
                  </button>
                  <button
                    onClick={handleUseTemplate}
                    className="btn btn-primary"
                  >
                    <svg style={{ width: '16px', height: '16px', marginRight: '6px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    使用此模板
                  </button>
                </div>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default TemplateLibraryModal;
