"""
PRD模板库相关的数据模型
"""
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


class TemplateBase(BaseModel):
    """模板基础模型"""
    name: str = Field(..., description="模板名称", min_length=1, max_length=100)
    description: Optional[str] = Field(None, description="模板描述", max_length=500)
    category: Optional[str] = Field(None, description="模板分类")
    tags: Optional[List[str]] = Field(default=[], description="模板标签")


class TemplateCreate(TemplateBase):
    """创建模板请求模型"""
    content: str = Field(..., description="模板内容（Markdown格式）")


class TemplateUpdate(BaseModel):
    """更新模板请求模型"""
    name: Optional[str] = Field(None, description="模板名称", min_length=1, max_length=100)
    description: Optional[str] = Field(None, description="模板描述", max_length=500)
    category: Optional[str] = Field(None, description="模板分类")
    tags: Optional[List[str]] = Field(None, description="模板标签")
    content: Optional[str] = Field(None, description="模板内容")


class TemplateResponse(TemplateBase):
    """模板响应模型"""
    id: str = Field(..., description="模板ID")
    content: str = Field(..., description="模板内容（Markdown格式）")
    download_count: int = Field(default=0, description="下载次数")
    created_at: datetime = Field(..., description="创建时间")
    updated_at: datetime = Field(..., description="更新时间")
    created_by: Optional[str] = Field(None, description="创建者")

    class Config:
        from_attributes = True


class TemplateListItem(BaseModel):
    """模板列表项（不包含完整内容）"""
    id: str = Field(..., description="模板ID")
    name: str = Field(..., description="模板名称")
    description: Optional[str] = Field(None, description="模板描述")
    category: Optional[str] = Field(None, description="模板分类")
    tags: List[str] = Field(default=[], description="模板标签")
    download_count: int = Field(default=0, description="下载次数")
    created_at: datetime = Field(..., description="创建时间")


class TemplateListResponse(BaseModel):
    """模板列表响应"""
    templates: List[TemplateListItem] = Field(..., description="模板列表")
    total: int = Field(..., description="总数")
    page: int = Field(default=1, description="当前页码")
    page_size: int = Field(default=20, description="每页数量")


class TemplateSearchRequest(BaseModel):
    """模板搜索请求"""
    keyword: Optional[str] = Field(None, description="搜索关键词")
    category: Optional[str] = Field(None, description="分类筛选")
    tags: Optional[List[str]] = Field(None, description="标签筛选")
    page: int = Field(default=1, description="页码", ge=1)
    page_size: int = Field(default=20, description="每页数量", ge=1, le=100)


class TemplateCategory(BaseModel):
    """模板分类"""
    id: str = Field(..., description="分类ID")
    name: str = Field(..., description="分类名称")
    count: int = Field(default=0, description="模板数量")


class TemplateCategoryListResponse(BaseModel):
    """模板分类列表响应"""
    categories: List[TemplateCategory] = Field(..., description="分类列表")
