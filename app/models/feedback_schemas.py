from pydantic import BaseModel, Field
from typing import List
from app.models.mysql_models import FeedbackType


class FeedbackCreate(BaseModel):
    """创建反馈请求模型"""
    type: FeedbackType = Field(default=FeedbackType.SUGGESTION, description="反馈类型")
    title: str = Field(..., min_length=1, max_length=255, description="反馈标题")
    content: str = Field(..., min_length=1, description="反馈内容")
    contact: str = Field(default="", max_length=100, description="联系方式")


class FeedbackResponse(BaseModel):
    """反馈响应模型"""
    id: int
    user_id: int
    type: FeedbackType
    title: str
    content: str
    contact: str
    created_at: str
    updated_at: str


class FeedbackListResponse(BaseModel):
    """反馈列表响应模型"""
    feedbacks: List[FeedbackResponse]
    total: int
