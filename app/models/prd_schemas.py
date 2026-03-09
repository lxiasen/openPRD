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