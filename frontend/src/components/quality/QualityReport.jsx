import React, { useState } from 'react';

const QualityReport = () => {
  const [selectedItems, setSelectedItems] = useState([]);
  const [filter, setFilter] = useState('all');
  
  const toggleSelect = (id) => {
    if (selectedItems.includes(id)) {
      setSelectedItems(selectedItems.filter(itemId => itemId !== id));
    } else {
      setSelectedItems([...selectedItems, id]);
    }
  };
  
  const toggleSelectAll = () => {
    if (selectedItems.length === checkItems.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(checkItems.map(item => item.id));
    }
  };
  
  const checkItems = [
    {
      id: 'CHECK-001',
      dimension: '功能需求-用户管理',
      description: '用户注册未明确密码强度要求',
      question: '密码长度、复杂度要求是什么？',
      required: '明确密码强度规则，包括长度、字符类型要求',
      suggestion: '密码长度至少8位，包含大小写字母、数字和特殊字符',
      risk: 'high'
    },
    {
      id: 'CHECK-002',
      dimension: '功能需求-商品管理',
      description: '商品搜索未明确搜索范围和排序规则',
      question: '搜索范围是否包括商品名称、描述？排序规则是什么？',
      required: '明确搜索范围和默认排序规则',
      suggestion: '搜索范围包括商品名称、描述、标签；默认按相关度排序',
      risk: 'medium'
    },
    {
      id: 'CHECK-003',
      dimension: '功能需求-订单管理',
      description: '支付功能未明确支持的支付方式',
      question: '具体支持哪些支付方式？',
      required: '列出所有支持的支付方式',
      suggestion: '支持支付宝、微信支付、银行卡支付',
      risk: 'high'
    },
    {
      id: 'CHECK-004',
      dimension: '非功能需求-性能',
      description: '未明确系统性能指标',
      question: '系统响应时间、并发处理能力要求是什么？',
      required: '明确性能指标和测试标准',
      suggestion: '页面响应时间<2秒，支持1000并发用户',
      risk: 'medium'
    },
    {
      id: 'CHECK-005',
      dimension: '技术方案-前端',
      description: '前端技术栈未明确版本要求',
      question: 'React、Node.js等技术的版本要求是什么？',
      required: '明确技术栈版本要求',
      suggestion: 'React 18+，Node.js 16+',
      risk: 'low'
    }
  ];
  
  const filteredItems = checkItems.filter(item => {
    if (filter === 'all') return true;
    return item.risk === filter;
  });
  
  const getRiskColor = (risk) => {
    switch (risk) {
      case 'high': return 'danger';
      case 'medium': return 'warning';
      case 'low': return 'success';
      default: return 'info';
    }
  };
  
  const getRiskText = (risk) => {
    switch (risk) {
      case 'high': return '高风险';
      case 'medium': return '中风险';
      case 'low': return '低风险';
      default: return '未知';
    }
  };
  
  const stats = {
    total: checkItems.length,
    high: checkItems.filter(item => item.risk === 'high').length,
    medium: checkItems.filter(item => item.risk === 'medium').length,
    low: checkItems.filter(item => item.risk === 'low').length,
    fixed: 0
  };
  
  return (
    <div className="mt-6">
      {/* 统计筛选栏 */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <div className="card p-4 border-t-4 border-primary-600">
          <div className="text-sm text-primary-500 mb-1">总检查项</div>
          <div className="text-2xl font-bold text-primary-900">{stats.total}</div>
        </div>
        <div className="card p-4 border-t-4 border-error-500">
          <div className="text-sm text-primary-500 mb-1">高风险</div>
          <div className="text-2xl font-bold text-error-500">{stats.high}</div>
        </div>
        <div className="card p-4 border-t-4 border-warning-500">
          <div className="text-sm text-primary-500 mb-1">中风险</div>
          <div className="text-2xl font-bold text-warning-500">{stats.medium}</div>
        </div>
        <div className="card p-4 border-t-4 border-success-500">
          <div className="text-sm text-primary-500 mb-1">低风险</div>
          <div className="text-2xl font-bold text-success-500">{stats.low}</div>
        </div>
        <div className="card p-4 border-t-4 border-brand-600">
          <div className="text-sm text-primary-500 mb-1">已修复</div>
          <div className="text-2xl font-bold text-brand-600">{stats.fixed}</div>
        </div>
      </div>
      
      <div className="flex justify-between items-center mb-4">
        <div className="flex gap-2">
          <button 
            className={`px-3 py-1 text-sm rounded-md ${filter === 'all' ? 'bg-brand-600 text-white' : 'bg-primary-100 text-primary-700 hover:bg-primary-200'}`}
            onClick={() => setFilter('all')}
          >
            全部
          </button>
          <button 
            className={`px-3 py-1 text-sm rounded-md ${filter === 'high' ? 'bg-danger-100 text-danger-700' : 'bg-primary-100 text-primary-700 hover:bg-primary-200'}`}
            onClick={() => setFilter('high')}
          >
            高风险
          </button>
          <button 
            className={`px-3 py-1 text-sm rounded-md ${filter === 'medium' ? 'bg-warning-100 text-warning-700' : 'bg-primary-100 text-primary-700 hover:bg-primary-200'}`}
            onClick={() => setFilter('medium')}
          >
            中风险
          </button>
          <button 
            className={`px-3 py-1 text-sm rounded-md ${filter === 'low' ? 'bg-success-100 text-success-700' : 'bg-primary-100 text-primary-700 hover:bg-primary-200'}`}
            onClick={() => setFilter('low')}
          >
            低风险
          </button>
        </div>
        
        {selectedItems.length > 0 && (
          <div className="flex gap-2">
            <button className="btn btn-secondary text-sm">
              标记为已修复
            </button>
            <button className="btn btn-secondary text-sm">
              导出选中
            </button>
          </div>
        )}
      </div>
      
      {/* 检查结果表格 */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-primary-50 border-b border-primary-200">
              <th className="px-4 py-3 text-left">
                <input 
                  type="checkbox" 
                  checked={selectedItems.length === checkItems.length && checkItems.length > 0} 
                  onChange={toggleSelectAll}
                  className="rounded border-primary-300 text-brand-600 focus:ring-brand-500"
                />
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-primary-700">检查项ID</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-primary-700">问题维度</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-primary-700">模糊点描述</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-primary-700">风险等级</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-primary-700">操作</th>
            </tr>
          </thead>
          <tbody>
            {filteredItems.map((item) => (
              <tr key={item.id} className="border-b border-primary-200 hover:bg-primary-50">
                <td className="px-4 py-3">
                  <input 
                    type="checkbox" 
                    checked={selectedItems.includes(item.id)} 
                    onChange={() => toggleSelect(item.id)}
                    className="rounded border-primary-300 text-brand-600 focus:ring-brand-500"
                  />
                </td>
                <td className="px-4 py-3 text-sm font-mono text-primary-700">{item.id}</td>
                <td className="px-4 py-3 text-sm text-primary-700">{item.dimension}</td>
                <td className="px-4 py-3 text-sm text-primary-700">{item.description}</td>
                <td className="px-4 py-3">
                  <span className={`tag tag-${getRiskColor(item.risk)}`}>
                    {getRiskText(item.risk)}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <button className="text-sm text-brand-600 hover:text-brand-700">
                    查看详情
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {filteredItems.length === 0 && (
        <div className="text-center py-12">
          <div className="text-primary-400 mb-2">无检查项</div>
          <div className="text-sm text-primary-500">当前筛选条件下没有检查项</div>
        </div>
      )}
    </div>
  );
};

export default QualityReport;