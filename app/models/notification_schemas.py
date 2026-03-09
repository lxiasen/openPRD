from pydantic import BaseModel, Field
from datetime import datetime
from typing import List, Optional


class NotificationBase(BaseModel):
    """通知基础模型"""
    title: str = Field(..., description="通知标题")
    content: str = Field(..., description="通知内容")
    type: str = Field(..., description="通知类型")
    related_id: Optional[int] = Field(None, description="关联ID")


class NotificationCreate(NotificationBase):
    """创建通知模型"""
    user_id: int = Field(..., description="用户ID")


class NotificationResponse(NotificationBase):
    """通知响应模型"""
    id: int
    user_id: int
    is_read: bool
    created_at: datetime
    
    class Config:
        from_attributes = True


class NotificationListResponse(BaseModel):
    """通知列表响应模型"""
    notifications: List[NotificationResponse]
    total: int
    page: int
    page_size: int


class NotificationUpdate(BaseModel):
    """通知更新模型"""
    is_read: bool = Field(..., description="是否已读")