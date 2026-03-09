from pydantic import BaseModel, Field
from typing import Optional


class NotificationSettingBase(BaseModel):
    """通知设置基础模型"""
    quality_check_notification: bool = Field(default=True, description="质检完成通知")


class NotificationSettingUpdate(NotificationSettingBase):
    """更新通知设置模型"""
    pass


class NotificationSettingResponse(NotificationSettingBase):
    """通知设置响应模型"""
    id: int
    user_id: int
    
    class Config:
        from_attributes = True
