"""
项目相关的Pydantic模型
"""
from pydantic import BaseModel, Field
from typing import List, Optional
from app.models.mysql_models import ProjectStatus


class ProjectUpdate(BaseModel):
    """项目更新模型"""
    name: Optional[str] = Field(None, max_length=255, description="项目名称")
    description: Optional[str] = Field(None, max_length=1000, description="项目描述")
    status: ProjectStatus = Field(None, description="项目状态")


class ProjectResponse(BaseModel):
    """项目响应模型"""
    id: int
    name: str
    description: Optional[str] = None
    status: ProjectStatus
    user_id: int
    prd_original_id: Optional[str] = None
    prd_optimized_id: Optional[str] = None
    created_at: str
    updated_at: str


class ProjectListResponse(BaseModel):
    """项目列表响应模型"""
    projects: List[ProjectResponse]
    total: int
