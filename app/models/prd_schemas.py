"""
PRD相关的Pydantic模型
"""
from pydantic import BaseModel, Field
from typing import List, Optional

class PRDUpload(BaseModel):
    """PRD上传模型"""
    project_name: str = Field(..., max_length=255, description="项目名称")
    description: Optional[str] = Field(None, max_length=1000, description="项目描述")


class PRDContent(BaseModel):
    """PRD内容模型"""
    id: str
    content: str
    title: str
    version: int
    is_optimized: bool


class CheckItemResponse(BaseModel):
    """检查项响应模型"""
    id: int
    check_id: str
    dimension: str
    issue_description: str
    customer_question: str
    required_info: str
    suggestion: str


class CheckItemUpdateRequest(BaseModel):
    """检查项更新请求模型"""
    dimension: Optional[str] = Field(None, max_length=100, description="问题维度")
    issue_description: Optional[str] = Field(None, description="模糊点描述")
    customer_question: Optional[str] = Field(None, description="客户提问")
    required_info: Optional[str] = Field(None, description="需补充明确的内容")
    suggestion: Optional[str] = Field(None, description="修改建议")


class PRDOptimizeRequest(BaseModel):
    """PRD优化请求模型"""
    project_id: int = Field(..., ge=1, description="项目ID")


class PRDDiffItem(BaseModel):
    """PRD差异项模型"""
    id: str
    type: str
    original: str
    modified: str
    status: str


class PRDDiffResponse(BaseModel):
    """PRD差异响应模型"""
    id: str
    project_id: int
    diff_items: List[PRDDiffItem]
    accepted_count: int
    rejected_count: int


class ExportRequest(BaseModel):
    """导出请求模型"""
    project_id: int = Field(..., ge=1, description="项目ID")
    format: str = Field(..., description="导出格式", pattern="^(markdown|word|pdf|excel)$")


class ExportResponse(BaseModel):
    """导出响应模型"""
    id: str
    project_id: int
    export_format: str
    file_path: str
    status: str
