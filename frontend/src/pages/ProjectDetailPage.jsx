import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import MDEditor from '@uiw/react-md-editor';
import QualityReport from '../components/quality/QualityReport';
import ExportModal from '../components/ExportModal';
import { AlertCircle, CheckCircle2, XCircle } from 'lucide-react';
import '../styles/common.css';

const ProjectDetailPage = () => {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState('prd');
  const [isEditMode, setIsEditMode] = useState(true);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [prdContent, setPrdContent] = useState(`# 电商平台PRD

## 1. 项目概述
本项目旨在开发一个电商平台，为用户提供商品浏览、购买、支付等功能。平台将支持PC端和移动端，提供良好的用户体验。

## 2. 功能需求

### 2.1 用户管理
用户管理模块包括注册、登录、个人信息管理等功能。
- 用户注册：支持手机号、邮箱注册
- 用户登录：支持手机号/邮箱+密码登录
- 个人信息管理：修改头像、昵称、密码等

### 2.2 商品管理
商品管理模块包括商品列表、商品详情、商品搜索等功能。
- 商品列表：支持分类筛选、排序
- 商品详情：展示商品图片、价格、描述等
- 商品搜索：支持关键词搜索

### 2.3 订单管理
订单管理模块包括下单、支付、订单查询等功能。
- 下单：将商品加入购物车并提交订单
- 支付：支持多种支付方式
- 订单查询：查看历史订单状态

## 3. 非功能需求
非功能需求包括性能、安全、兼容性等方面。

## 4. 技术方案
技术方案包括前端技术栈、后端技术栈、数据库选择等。`);
  
  // 模拟优化版PRD数据
  const [optimizedPrdContent, setOptimizedPrdContent] = useState([
    {
      id: 'CHECK-001',
      section: '1. 项目概述',
      original: '本项目旨在开发一个电商平台，为用户提供商品浏览、购买、支付等功能。平台将支持PC端和移动端，提供良好的用户体验。',
      optimized: '本项目旨在开发一个电商平台，为用户提供商品浏览、购买、支付等全流程功能。平台将支持PC端和移动端响应式布局，提供流畅的用户体验。',
      reason: '补充了"全流程"表述，明确了响应式布局要求，使需求更具体可落地。',
      isActive: true
    },
    {
      id: 'CHECK-002',
      section: '2.1 用户管理',
      original: '用户注册：支持手机号、邮箱注册',
      optimized: '用户注册：支持手机号、邮箱注册，需进行短信/邮件验证码验证，密码强度要求为8-20位包含字母和数字。',
      reason: '补充了注册流程的验证方式和密码强度要求，使需求更具体。',
      isActive: true
    },
    {
      id: 'CHECK-003',
      section: '2.3 订单管理',
      original: '支付：支持多种支付方式',
      optimized: '支付：支持微信支付、支付宝、银行卡三种支付方式，支付超时时间为30分钟，超时后订单自动取消。',
      reason: '明确了具体的支付方式和超时规则，使需求更可落地。',
      isActive: true
    },
    {
      id: 'CHECK-004',
      section: '3. 非功能需求',
      original: '非功能需求包括性能、安全、兼容性等方面。',
      optimized: '非功能需求包括：\n1. 性能：页面加载时间不超过2秒，并发用户数支持1000人同时在线。\n2. 安全：采用HTTPS协议，数据传输加密，定期安全审计。\n3. 兼容性：支持Chrome、Firefox、Safari、Edge主流浏览器，移动端支持iOS 12+、Android 6+。',
      reason: '将非功能需求具体化，明确了性能指标、安全要求和兼容性范围。',
      isActive: true
    }
  ]);
  const [selectedDiffItem, setSelectedDiffItem] = useState(optimizedPrdContent[0]);
  
  // 撤销修改功能
  const handleUndoChange = (id) => {
    setOptimizedPrdContent(prev => 
      prev.map(item => 
        item.id === id ? { ...item, isActive: false } : item
      )
    );
  };

  // 全选拒绝功能
  const handleSelectAllReject = () => {
    setOptimizedPrdContent(prev => 
      prev.map(item => ({ ...item, isActive: false }))
    );
  };

  // 全选接纳功能
  const handleSelectAllAccept = () => {
    setOptimizedPrdContent(prev => 
      prev.map(item => ({ ...item, isActive: true }))
    );
  };

  return (
    <div className="page-content fade-in" style={{marginTop: '65px', minHeight: 'calc(100vh - 65px)'}}>
      <div className="page-header-actions">
        <h1 className="page-title">项目详情</h1>
        <div className="flex gap-2">
          <button className="btn btn-secondary" onClick={() => setIsExportModalOpen(true)}>
            导出
          </button>
          <button className="btn btn-primary">
            开始质检
          </button>
        </div>
      </div>
      <div className="card mb-6" style={{maxWidth: '100%'}}>
        <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '24px', padding: '16px 24px'}}>
          <div>
            <h3 style={{fontSize: '14px', fontWeight: '500', color: '#64748B', marginBottom: '8px'}}>项目名称</h3>
            <p style={{fontWeight: '600', color: '#0F172A'}}>电商平台PRD</p>
          </div>
          <div>
            <h3 style={{fontSize: '14px', fontWeight: '500', color: '#64748B', marginBottom: '8px'}}>创建时间</h3>
            <p style={{color: '#334155'}}>2026-03-04 10:30</p>
          </div>
          <div>
            <h3 style={{fontSize: '14px', fontWeight: '500', color: '#64748B', marginBottom: '8px'}}>状态</h3>
            <span className="badge badge-info">进行中</span>
          </div>
        </div>
      </div>
      <div className="card" style={{maxWidth: '100%'}}>
        <div style={{display: 'flex', borderBottom: '1px solid #E2E8F0'}}>
          <button 
            style={{padding: '12px 16px', cursor: 'pointer', transition: 'all 0.2s ease', borderBottom: activeTab === 'prd' ? '2px solid #0891B2' : 'none', color: activeTab === 'prd' ? '#0891B2' : '#64748B', fontWeight: activeTab === 'prd' ? '500' : 'normal'}}
            onClick={() => setActiveTab('prd')}
          >
            PRD原文
          </button>
          <button 
            style={{padding: '12px 16px', cursor: 'pointer', transition: 'all 0.2s ease', borderBottom: activeTab === 'quality' ? '2px solid #0891B2' : 'none', color: activeTab === 'quality' ? '#0891B2' : '#64748B', fontWeight: activeTab === 'quality' ? '500' : 'normal'}}
            onClick={() => setActiveTab('quality')}
          >
            质检报告
          </button>
          <button 
            style={{padding: '12px 16px', cursor: 'pointer', transition: 'all 0.2s ease', borderBottom: activeTab === 'optimized' ? '2px solid #0891B2' : 'none', color: activeTab === 'optimized' ? '#0891B2' : '#64748B', fontWeight: activeTab === 'optimized' ? '500' : 'normal'}}
            onClick={() => setActiveTab('optimized')}
          >
            优化版PRD
          </button>
          <button 
            style={{padding: '12px 16px', cursor: 'pointer', transition: 'all 0.2s ease', borderBottom: activeTab === 'diff' ? '2px solid #0891B2' : 'none', color: activeTab === 'diff' ? '#0891B2' : '#64748B', fontWeight: activeTab === 'diff' ? '500' : 'normal'}}
            onClick={() => setActiveTab('diff')}
          >
            差异对比
          </button>
        </div>
        {activeTab === 'prd' && (
          <div style={{padding: '24px'}}>
            <div className="flex justify-between items-center mb-4">
              <h3 style={{fontWeight: '600', color: '#0F172A'}}>PRD原文编辑器</h3>
              <div className="flex gap-2">
                <button 
                  style={{padding: '4px 12px', fontSize: '14px', borderRadius: '6px', backgroundColor: isEditMode ? '#0891B2' : '#F1F5F9', color: isEditMode ? 'white' : '#334155', cursor: 'pointer', transition: 'all 0.2s ease'}}
                  onClick={() => setIsEditMode(true)}
                >
                  编辑
                </button>
                <button 
                  style={{padding: '4px 12px', fontSize: '14px', borderRadius: '6px', backgroundColor: !isEditMode ? '#0891B2' : '#F1F5F9', color: !isEditMode ? 'white' : '#334155', cursor: 'pointer', transition: 'all 0.2s ease'}}
                  onClick={() => setIsEditMode(false)}
                >
                  预览
                </button>
              </div>
            </div>
            <div style={{display: 'flex', gap: '24px'}}>
              <div style={{width: '20%'}}>
                <div style={{position: 'sticky', top: '80px'}}>
                  <h3 style={{fontWeight: '600', color: '#0F172A', marginBottom: '16px'}}>大纲</h3>
                  <ul style={{listStyle: 'none', padding: 0, margin: 0, lineHeight: '1.5'}}>
                    <li style={{marginBottom: '8px'}}>
                      <a href="#" style={{color: '#0891B2', fontWeight: '500', textDecoration: 'none'}}>1. 项目概述</a>
                    </li>
                    <li style={{marginBottom: '8px'}}>
                      <a href="#" style={{color: '#334155', textDecoration: 'none', transition: 'color 0.2s ease'}} onMouseOver={(e) => e.target.style.color = '#0891B2'} onMouseOut={(e) => e.target.style.color = '#334155'}>2. 功能需求</a>
                      <ul style={{paddingLeft: '16px', marginTop: '8px'}}>
                        <li style={{marginBottom: '4px'}}>
                          <a href="#" style={{color: '#64748B', fontSize: '14px', textDecoration: 'none', transition: 'color 0.2s ease'}} onMouseOver={(e) => e.target.style.color = '#0891B2'} onMouseOut={(e) => e.target.style.color = '#64748B'}>2.1 用户管理</a>
                        </li>
                        <li style={{marginBottom: '4px'}}>
                          <a href="#" style={{color: '#64748B', fontSize: '14px', textDecoration: 'none', transition: 'color 0.2s ease'}} onMouseOver={(e) => e.target.style.color = '#0891B2'} onMouseOut={(e) => e.target.style.color = '#64748B'}>2.2 商品管理</a>
                        </li>
                        <li style={{marginBottom: '4px'}}>
                          <a href="#" style={{color: '#64748B', fontSize: '14px', textDecoration: 'none', transition: 'color 0.2s ease'}} onMouseOver={(e) => e.target.style.color = '#0891B2'} onMouseOut={(e) => e.target.style.color = '#64748B'}>2.3 订单管理</a>
                        </li>
                      </ul>
                    </li>
                    <li style={{marginBottom: '8px'}}>
                      <a href="#" style={{color: '#334155', textDecoration: 'none', transition: 'color 0.2s ease'}} onMouseOver={(e) => e.target.style.color = '#0891B2'} onMouseOut={(e) => e.target.style.color = '#334155'}>3. 非功能需求</a>
                    </li>
                    <li style={{marginBottom: '8px'}}>
                      <a href="#" style={{color: '#334155', textDecoration: 'none', transition: 'color 0.2s ease'}} onMouseOver={(e) => e.target.style.color = '#0891B2'} onMouseOut={(e) => e.target.style.color = '#334155'}>4. 技术方案</a>
                    </li>
                  </ul>
                </div>
              </div>
              <div style={{width: '80%'}}>
                {isEditMode ? (
                  <div style={{border: '1px solid #E2E8F0', borderRadius: '8px', overflow: 'hidden'}}>
                    <MDEditor
                      value={prdContent}
                      onChange={setPrdContent}
                      height={600}
                      className="min-h-[600px]"
                    />
                  </div>
                ) : (
                  <div style={{border: '1px solid #E2E8F0', borderRadius: '8px', padding: '24px', backgroundColor: '#F8FAFC', minHeight: '600px'}}>
                    <MDEditor.Markdown
                      source={prdContent}
                      wrapperElement={{ 
                        'data-color-mode': 'light' 
                      }}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        {activeTab === 'quality' && (
          <QualityReport />
        )}
        {activeTab === 'optimized' && (
          <div style={{padding: '24px'}}>
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <h3 style={{fontWeight: '600', color: '#0F172A'}}>优化版PRD</h3>
                <span style={{display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '2px 8px', backgroundColor: '#F3E8FF', color: '#7E22CE', borderRadius: '6px', fontSize: '12px', fontWeight: '500'}}>
                  <AlertCircle size={12} />
                  AI生成
                </span>
              </div>
              <div style={{fontSize: '14px', color: '#64748B'}}>
                基于质检结果自动优化
              </div>
            </div>
            <div style={{border: '1px solid #E2E8F0', borderRadius: '8px', padding: '24px', backgroundColor: '#F8FAFC', minHeight: '600px'}}>
                <h1 style={{fontSize: '24px', fontWeight: '600', color: '#0F172A', marginBottom: '24px'}}>电商平台PRD</h1>
                
                <h2 style={{fontSize: '20px', fontWeight: '600', color: '#1E293B', marginBottom: '16px'}}>1. 项目概述</h2>
                <p style={{marginBottom: '16px'}}>
                  {optimizedPrdContent.find(item => item.id === 'CHECK-001').isActive ? (
                    <div style={{position: 'relative'}} className="group">
                      <span style={{backgroundColor: '#EFF6FF', borderLeft: '4px solid #3B82F6', padding: '8px 12px', display: 'block', borderRadius: '0 6px 6px 0'}}>
                        {optimizedPrdContent.find(item => item.id === 'CHECK-001').optimized}
                      </span>
                      <button 
                        onClick={() => handleUndoChange('CHECK-001')}
                        style={{position: 'absolute', top: '8px', right: '8px', padding: '4px', color: '#94A3B8', cursor: 'pointer', borderRadius: '50%', transition: 'all 0.2s ease'}} onMouseOver={(e) => e.target.style.backgroundColor = '#F1F5F9'}
                        title="撤销修改"
                      >
                        <XCircle size={16} />
                      </button>
                      <div style={{position: 'absolute', left: '0', bottom: '100%', marginBottom: '8px', width: '320px', backgroundColor: 'white', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)', borderRadius: '6px', padding: '12px', fontSize: '12px', color: '#334155', opacity: 0, transition: 'opacity 0.2s ease'}} className="group-hover:opacity-100">
                        <div style={{fontWeight: '500', marginBottom: '4px'}}>修改说明</div>
                        <div>{optimizedPrdContent.find(item => item.id === 'CHECK-001').reason}</div>
                      </div>
                    </div>
                  ) : (
                    optimizedPrdContent.find(item => item.id === 'CHECK-001').original
                  )}
                </p>
                
                <h2 style={{fontSize: '20px', fontWeight: '600', color: '#1E293B', marginBottom: '16px'}}>2. 功能需求</h2>
                
                <h3 style={{fontSize: '18px', fontWeight: '600', color: '#334155', marginBottom: '12px'}}>2.1 用户管理</h3>
                <p style={{marginBottom: '8px'}}>用户管理模块包括注册、登录、个人信息管理等功能。</p>
                <ul style={{listStyle: 'disc', paddingLeft: '24px', marginBottom: '16px', lineHeight: '1.5'}}>
                  <li style={{marginBottom: '8px'}}>
                    {optimizedPrdContent.find(item => item.id === 'CHECK-002').isActive ? (
                      <div style={{position: 'relative'}} className="group">
                        <span style={{backgroundColor: '#EFF6FF', borderLeft: '4px solid #3B82F6', padding: '8px 12px', display: 'block', borderRadius: '0 6px 6px 0'}}>
                          {optimizedPrdContent.find(item => item.id === 'CHECK-002').optimized}
                        </span>
                        <button 
                          onClick={() => handleUndoChange('CHECK-002')}
                          style={{position: 'absolute', top: '8px', right: '8px', padding: '4px', color: '#94A3B8', cursor: 'pointer', borderRadius: '50%', transition: 'all 0.2s ease'}} onMouseOver={(e) => e.target.style.backgroundColor = '#F1F5F9'}
                          title="撤销修改"
                        >
                          <XCircle size={16} />
                        </button>
                        <div style={{position: 'absolute', left: '0', bottom: '100%', marginBottom: '8px', width: '320px', backgroundColor: 'white', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)', borderRadius: '6px', padding: '12px', fontSize: '12px', color: '#334155', opacity: 0, transition: 'opacity 0.2s ease'}} className="group-hover:opacity-100">
                          <div style={{fontWeight: '500', marginBottom: '4px'}}>修改说明</div>
                          <div>{optimizedPrdContent.find(item => item.id === 'CHECK-002').reason}</div>
                        </div>
                      </div>
                    ) : (
                      optimizedPrdContent.find(item => item.id === 'CHECK-002').original
                    )}
                  </li>
                  <li style={{marginBottom: '8px'}}>用户登录：支持手机号/邮箱+密码登录</li>
                  <li style={{marginBottom: '8px'}}>个人信息管理：修改头像、昵称、密码等</li>
                </ul>
                
                <h3 style={{fontSize: '18px', fontWeight: '600', color: '#334155', marginBottom: '12px'}}>2.2 商品管理</h3>
                <p style={{marginBottom: '8px'}}>商品管理模块包括商品列表、商品详情、商品搜索等功能。</p>
                <ul style={{listStyle: 'disc', paddingLeft: '24px', marginBottom: '16px', lineHeight: '1.5'}}>
                  <li style={{marginBottom: '8px'}}>商品列表：支持分类筛选、排序</li>
                  <li style={{marginBottom: '8px'}}>商品详情：展示商品图片、价格、描述等</li>
                  <li style={{marginBottom: '8px'}}>商品搜索：支持关键词搜索</li>
                </ul>
                
                <h3 style={{fontSize: '18px', fontWeight: '600', color: '#334155', marginBottom: '12px'}}>2.3 订单管理</h3>
                <p style={{marginBottom: '8px'}}>订单管理模块包括下单、支付、订单查询等功能。</p>
                <ul style={{listStyle: 'disc', paddingLeft: '24px', marginBottom: '16px', lineHeight: '1.5'}}>
                  <li style={{marginBottom: '8px'}}>下单：将商品加入购物车并提交订单</li>
                  <li style={{marginBottom: '8px'}}>
                    {optimizedPrdContent.find(item => item.id === 'CHECK-003').isActive ? (
                      <div style={{position: 'relative'}} className="group">
                        <span style={{backgroundColor: '#EFF6FF', borderLeft: '4px solid #3B82F6', padding: '8px 12px', display: 'block', borderRadius: '0 6px 6px 0'}}>
                          {optimizedPrdContent.find(item => item.id === 'CHECK-003').optimized}
                        </span>
                        <button 
                          onClick={() => handleUndoChange('CHECK-003')}
                          style={{position: 'absolute', top: '8px', right: '8px', padding: '4px', color: '#94A3B8', cursor: 'pointer', borderRadius: '50%', transition: 'all 0.2s ease'}} onMouseOver={(e) => e.target.style.backgroundColor = '#F1F5F9'}
                          title="撤销修改"
                        >
                          <XCircle size={16} />
                        </button>
                        <div style={{position: 'absolute', left: '0', bottom: '100%', marginBottom: '8px', width: '320px', backgroundColor: 'white', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)', borderRadius: '6px', padding: '12px', fontSize: '12px', color: '#334155', opacity: 0, transition: 'opacity 0.2s ease'}} className="group-hover:opacity-100">
                          <div style={{fontWeight: '500', marginBottom: '4px'}}>修改说明</div>
                          <div>{optimizedPrdContent.find(item => item.id === 'CHECK-003').reason}</div>
                        </div>
                      </div>
                    ) : (
                      optimizedPrdContent.find(item => item.id === 'CHECK-003').original
                    )}
                  </li>
                  <li style={{marginBottom: '8px'}}>订单查询：查看历史订单状态</li>
                </ul>
                
                <h2 style={{fontSize: '20px', fontWeight: '600', color: '#1E293B', marginBottom: '16px'}}>3. 非功能需求</h2>
                <p style={{marginBottom: '16px'}}>
                  {optimizedPrdContent.find(item => item.id === 'CHECK-004').isActive ? (
                    <div style={{position: 'relative'}} className="group">
                      <span style={{backgroundColor: '#EFF6FF', borderLeft: '4px solid #3B82F6', padding: '8px 12px', display: 'block', borderRadius: '0 6px 6px 0'}}>
                        {optimizedPrdContent.find(item => item.id === 'CHECK-004').optimized}
                      </span>
                      <button 
                        onClick={() => handleUndoChange('CHECK-004')}
                        style={{position: 'absolute', top: '8px', right: '8px', padding: '4px', color: '#94A3B8', cursor: 'pointer', borderRadius: '50%', transition: 'all 0.2s ease'}} onMouseOver={(e) => e.target.style.backgroundColor = '#F1F5F9'}
                        title="撤销修改"
                      >
                        <XCircle size={16} />
                      </button>
                      <div style={{position: 'absolute', left: '0', bottom: '100%', marginBottom: '8px', width: '320px', backgroundColor: 'white', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)', borderRadius: '6px', padding: '12px', fontSize: '12px', color: '#334155', opacity: 0, transition: 'opacity 0.2s ease'}} className="group-hover:opacity-100">
                        <div style={{fontWeight: '500', marginBottom: '4px'}}>修改说明</div>
                        <div>{optimizedPrdContent.find(item => item.id === 'CHECK-004').reason}</div>
                      </div>
                    </div>
                  ) : (
                    optimizedPrdContent.find(item => item.id === 'CHECK-004').original
                  )}
                </p>
                
                <h2 style={{fontSize: '20px', fontWeight: '600', color: '#1E293B', marginBottom: '16px'}}>4. 技术方案</h2>
                <p style={{marginBottom: '16px'}}>技术方案包括前端技术栈、后端技术栈、数据库选择等。</p>
            </div>
          </div>
        )}
        {activeTab === 'diff' && (
          <div style={{padding: '24px'}}>
            <div className="flex justify-between items-center mb-4">
              <h3 style={{fontWeight: '600', color: '#0F172A'}}>差异对比与修改确认</h3>
              <div className="flex gap-2">
                <button 
                  className="btn btn-secondary"
                  onClick={handleSelectAllReject}
                >
                  全选拒绝
                </button>
                <button 
                  className="btn btn-primary"
                  onClick={handleSelectAllAccept}
                >
                  全选接纳
                </button>
              </div>
            </div>
            <div style={{display: 'flex', gap: '24px'}}>
              <div style={{width: '66.666%'}}>
                <div style={{display: 'flex', border: '1px solid #E2E8F0', borderRadius: '8px', overflow: 'hidden'}}>
                  {/* 左侧原文 */}
                  <div style={{width: '50%', borderRight: '1px solid #E2E8F0'}}>
                    <div style={{backgroundColor: '#F1F5F9', padding: '8px 16px', borderBottom: '1px solid #E2E8F0', fontWeight: '500', color: '#334155'}}>
                      原始PRD
                    </div>
                    <div style={{padding: '16px', backgroundColor: 'white', minHeight: '600px', overflowY: 'auto'}}>
                      {optimizedPrdContent.map((item, index) => (
                        <div 
                          key={item.id} 
                          style={{marginBottom: '24px', cursor: 'pointer', padding: selectedDiffItem.id === item.id ? '12px' : '0', backgroundColor: selectedDiffItem.id === item.id ? '#F8FAFC' : 'transparent', borderRadius: selectedDiffItem.id === item.id ? '8px' : '0'}}
                          onClick={() => setSelectedDiffItem(item)}
                        >
                          <h4 style={{fontWeight: '600', color: '#1E293B', marginBottom: '8px'}}>{item.section}</h4>
                          <div style={{position: 'relative'}}>
                            <div style={{paddingLeft: '24px', borderLeft: '2px solid #FCA5A5'}}>
                              <p style={{color: '#DC2626'}}>{item.original}</p>
                            </div>
                            <div style={{position: 'absolute', left: '0', top: '0', bottom: '0', width: '6px', backgroundColor: '#FEE2E2'}}></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  {/* 右侧优化版 */}
                  <div style={{width: '50%'}}>
                    <div style={{backgroundColor: '#F1F5F9', padding: '8px 16px', borderBottom: '1px solid #E2E8F0', fontWeight: '500', color: '#334155'}}>
                      优化版PRD
                    </div>
                    <div style={{padding: '16px', backgroundColor: 'white', minHeight: '600px', overflowY: 'auto'}}>
                      {optimizedPrdContent.map((item, index) => (
                        <div 
                          key={item.id} 
                          style={{marginBottom: '24px', cursor: 'pointer', padding: selectedDiffItem.id === item.id ? '12px' : '0', backgroundColor: selectedDiffItem.id === item.id ? '#F8FAFC' : 'transparent', borderRadius: selectedDiffItem.id === item.id ? '8px' : '0'}}
                          onClick={() => setSelectedDiffItem(item)}
                        >
                          <h4 style={{fontWeight: '600', color: '#1E293B', marginBottom: '8px'}}>{item.section}</h4>
                          <div style={{position: 'relative'}}>
                            <div style={{paddingLeft: '24px', borderLeft: '2px solid #86EFAC'}}>
                              <p style={{color: '#15803D'}}>{item.optimized}</p>
                            </div>
                            <div style={{position: 'absolute', left: '0', top: '0', bottom: '0', width: '6px', backgroundColor: '#DCFCE7'}}></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              {/* 右侧联动面板 */}
              <div style={{width: '33.333%'}}>
                <div style={{border: '1px solid #E2E8F0', borderRadius: '8px', overflow: 'hidden'}}>
                  <div style={{backgroundColor: '#F1F5F9', padding: '8px 16px', borderBottom: '1px solid #E2E8F0', fontWeight: '500', color: '#334155'}}>
                    修改详情
                  </div>
                  <div style={{padding: '16px', backgroundColor: 'white', minHeight: '600px'}}>
                    <div style={{marginBottom: '16px'}}>
                      <h4 style={{fontWeight: '500', color: '#1E293B', marginBottom: '8px'}}>修改点信息</h4>
                      <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '8px'}}>
                        <span style={{color: '#64748B'}}>检查项ID:</span>
                        <span style={{fontFamily: 'monospace', color: '#0891B2'}}>{selectedDiffItem.id}</span>
                      </div>
                      <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '8px'}}>
                        <span style={{color: '#64748B'}}>修改位置:</span>
                        <span>{selectedDiffItem.section}</span>
                      </div>
                      <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '8px'}}>
                        <span style={{color: '#64748B'}}>修改类型:</span>
                        <span className="badge badge-primary">内容补充</span>
                      </div>
                    </div>
                    <div style={{marginBottom: '16px'}}>
                      <h4 style={{fontWeight: '500', color: '#1E293B', marginBottom: '8px'}}>修改说明</h4>
                      <p style={{color: '#475569', fontSize: '14px'}}>{selectedDiffItem.reason}</p>
                    </div>
                    <div style={{marginBottom: '16px'}}>
                      <h4 style={{fontWeight: '500', color: '#1E293B', marginBottom: '8px'}}>原始内容</h4>
                      <div style={{border: '1px solid #E2E8F0', borderRadius: '6px', padding: '12px', backgroundColor: '#FEE2E2', fontSize: '14px'}}>
                        <p style={{color: '#DC2626'}}>{selectedDiffItem.original}</p>
                      </div>
                    </div>
                    <div style={{marginBottom: '24px'}}>
                      <h4 style={{fontWeight: '500', color: '#1E293B', marginBottom: '8px'}}>优化内容</h4>
                      <div style={{border: '1px solid #E2E8F0', borderRadius: '6px', padding: '12px', backgroundColor: '#DCFCE7', fontSize: '14px'}}>
                        <p style={{color: '#15803D'}}>{selectedDiffItem.optimized}</p>
                      </div>
                    </div>
                    <div style={{display: 'flex', gap: '8px'}}>
                      <button 
                        className="btn btn-secondary flex-1"
                        onClick={() => handleUndoChange(selectedDiffItem.id)}
                      >
                        拒绝修改
                      </button>
                      <button className="btn btn-primary flex-1">
                        接纳修改
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* 导出弹窗 */}
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        projectName="电商平台PRD"
        prdContent={prdContent}
        qualityReport={{
          totalChecks: 12,
          issues: 4,
          suggestions: 8
        }}
      />
    </div>
  );
};

export default ProjectDetailPage;