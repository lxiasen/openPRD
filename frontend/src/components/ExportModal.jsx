import React, { useState } from 'react';
import MDEditor from '@uiw/react-md-editor';
import { CheckCircle2, FileText, FileSpreadsheet, File, X, Download } from 'lucide-react';

const ExportModal = ({ isOpen, onClose, projectName, prdContent, qualityReport }) => {
  const [activeTab, setActiveTab] = useState('prd');
  const [exportFormat, setExportFormat] = useState('markdown');
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);

  const handleExport = () => {
    setIsExporting(true);
    
    try {
      let content = prdContent;
      let filename = `${projectName}`;
      let mimeType = 'text/markdown';
      
      if (exportFormat === 'markdown') {
        filename += '.md';
        mimeType = 'text/markdown';
      } else if (exportFormat === 'word') {
        filename += '.docx';
        mimeType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
      } else if (exportFormat === 'pdf') {
        filename += '.pdf';
        mimeType = 'application/pdf';
      } else if (exportFormat === 'excel') {
        filename += '.xlsx';
        mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      }
      
      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      setIsExporting(false);
      setExportSuccess(true);
      
      setTimeout(() => {
        setExportSuccess(false);
        onClose();
      }, 3000);
    } catch (error) {
      setIsExporting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-modal flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* 弹窗头部 */}
        <div className="flex justify-between items-center p-6 border-b border-primary-200">
          <h2 className="text-h2 font-semibold text-primary-900">导出与归档</h2>
          <button
            onClick={onClose}
            className="text-primary-400 hover:text-primary-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* 成功提示 */}
        {exportSuccess && (
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white p-4">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-8 h-8" />
              <div>
                <h3 className="font-semibold text-lg">导出成功</h3>
                <p className="text-green-100">PRD已成功导出到本地</p>
              </div>
            </div>
          </div>
        )}

        {/* 弹窗内容 */}
        <div className="p-6">
          {/* 项目信息 */}
          <div className="mb-6 p-4 bg-primary-50 rounded-lg">
            <h3 className="font-semibold text-primary-900 mb-2">项目信息</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span className="text-primary-500 text-sm">项目名称:</span>
                <p className="font-medium text-primary-800">{projectName}</p>
              </div>
              <div>
                <span className="text-primary-500 text-sm">导出时间:</span>
                <p className="font-medium text-primary-800">{new Date().toLocaleString()}</p>
              </div>
            </div>
          </div>

          {/* 双Tab预览 */}
          <div className="mb-6">
            <div className="flex border-b border-primary-200 mb-4">
              <button
                onClick={() => setActiveTab('prd')}
                className={`flex-1 py-3 px-4 text-center font-medium transition-colors ${activeTab === 'prd' ? 'text-brand-600 border-b-2 border-brand-600' : 'text-primary-500 hover:text-primary-700'}`}
              >
                最终PRD预览
              </button>
              <button
                onClick={() => setActiveTab('report')}
                className={`flex-1 py-3 px-4 text-center font-medium transition-colors ${activeTab === 'report' ? 'text-brand-600 border-b-2 border-brand-600' : 'text-primary-500 hover:text-primary-700'}`}
              >
                质检报告预览
              </button>
            </div>

            {/* PRD预览 */}
            {activeTab === 'prd' && (
              <div className="border border-primary-200 rounded-lg p-6 bg-primary-50 min-h-[400px] overflow-y-auto">
                <MDEditor.Markdown
                  source={prdContent}
                  wrapperElement={{
                    'data-color-mode': 'light'
                  }}
                />
              </div>
            )}

            {/* 质检报告预览 */}
            {activeTab === 'report' && (
              <div className="border border-primary-200 rounded-lg p-6 bg-primary-50 min-h-[400px] overflow-y-auto">
                <h3 className="font-semibold text-primary-900 mb-4">质检报告摘要</h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 bg-white rounded-lg shadow-sm border border-primary-200">
                      <p className="text-primary-500 text-sm">总检查项</p>
                      <p className="text-2xl font-bold text-primary-900">12</p>
                    </div>
                    <div className="p-4 bg-white rounded-lg shadow-sm border border-primary-200">
                      <p className="text-primary-500 text-sm">问题数量</p>
                      <p className="text-2xl font-bold text-danger">4</p>
                    </div>
                    <div className="p-4 bg-white rounded-lg shadow-sm border border-primary-200">
                      <p className="text-primary-500 text-sm">优化建议</p>
                      <p className="text-2xl font-bold text-success">8</p>
                    </div>
                  </div>
                  <div className="bg-white rounded-lg shadow-sm border border-primary-200 p-4">
                    <h4 className="font-semibold text-primary-800 mb-2">主要问题</h4>
                    <ul className="list-disc pl-6 space-y-2 text-primary-600">
                      <li>项目概述缺少具体目标和范围</li>
                      <li>用户注册流程缺少验证机制</li>
                      <li>支付方式未明确具体类型</li>
                      <li>非功能需求缺少具体指标</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 导出格式选择 */}
          <div className="mb-6">
            <h3 className="font-semibold text-primary-900 mb-3">导出格式</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <button
                onClick={() => setExportFormat('markdown')}
                className={`p-4 border rounded-lg transition-all ${exportFormat === 'markdown' ? 'border-brand-600 bg-brand-50' : 'border-primary-200 hover:border-primary-300'}`}
              >
                <div className="flex flex-col items-center gap-2">
                  <FileText className={`w-8 h-8 ${exportFormat === 'markdown' ? 'text-brand-600' : 'text-primary-500'}`} />
                  <span className={`font-medium ${exportFormat === 'markdown' ? 'text-brand-600' : 'text-primary-700'}`}>Markdown</span>
                  <span className="text-xs text-primary-500">.md</span>
                </div>
              </button>
              <button
                onClick={() => setExportFormat('word')}
                className={`p-4 border rounded-lg transition-all ${exportFormat === 'word' ? 'border-brand-600 bg-brand-50' : 'border-primary-200 hover:border-primary-300'}`}
              >
                <div className="flex flex-col items-center gap-2">
                  <File className={`w-8 h-8 ${exportFormat === 'word' ? 'text-brand-600' : 'text-primary-500'}`} />
                  <span className={`font-medium ${exportFormat === 'word' ? 'text-brand-600' : 'text-primary-700'}`}>Word</span>
                  <span className="text-xs text-primary-500">.docx</span>
                </div>
              </button>
              <button
                onClick={() => setExportFormat('pdf')}
                className={`p-4 border rounded-lg transition-all ${exportFormat === 'pdf' ? 'border-brand-600 bg-brand-50' : 'border-primary-200 hover:border-primary-300'}`}
              >
                <div className="flex flex-col items-center gap-2">
                  <File className={`w-8 h-8 ${exportFormat === 'pdf' ? 'text-brand-600' : 'text-primary-500'}`} />
                  <span className={`font-medium ${exportFormat === 'pdf' ? 'text-brand-600' : 'text-primary-700'}`}>PDF</span>
                  <span className="text-xs text-primary-500">.pdf</span>
                </div>
              </button>
              <button
                onClick={() => setExportFormat('excel')}
                className={`p-4 border rounded-lg transition-all ${exportFormat === 'excel' ? 'border-brand-600 bg-brand-50' : 'border-primary-200 hover:border-primary-300'}`}
              >
                <div className="flex flex-col items-center gap-2">
                  <FileSpreadsheet className={`w-8 h-8 ${exportFormat === 'excel' ? 'text-brand-600' : 'text-primary-500'}`} />
                  <span className={`font-medium ${exportFormat === 'excel' ? 'text-brand-600' : 'text-primary-700'}`}>Excel</span>
                  <span className="text-xs text-primary-500">.xlsx</span>
                </div>
              </button>
            </div>
          </div>

          {/* 操作按钮 */}
          <div className="flex justify-end gap-4 pt-4 border-t border-primary-200">
            <button
              onClick={onClose}
              className="btn btn-secondary px-6 py-2"
            >
              取消
            </button>
            <button
              onClick={handleExport}
              className="btn btn-primary px-6 py-2 flex items-center gap-2"
              disabled={isExporting}
            >
              {isExporting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  导出中...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  开始导出
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExportModal;