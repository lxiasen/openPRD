from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.utils.mysql_client import get_db
from app.models.mysql_models import User, Notification, NotificationSetting
from app.models.notification_schemas import (
    NotificationResponse, 
    NotificationListResponse,
    NotificationCreate
)
from app.models.notification_setting_schemas import (
    NotificationSettingResponse,
    NotificationSettingUpdate
)
from app.api.auth import get_current_user
from app.utils.websocket_manager import manager

router = APIRouter(prefix="/notifications", tags=["notifications"])


@router.get("", response_model=NotificationListResponse)
async def get_notifications(
    page: int = 1, 
    page_size: int = 20,
    current_user: User = Depends(get_current_user), 
    db: Session = Depends(get_db)
):
    """获取通知列表"""
    skip = (page - 1) * page_size
    notifications = db.query(Notification).filter(
        Notification.user_id == current_user.id
    ).order_by(
        Notification.created_at.desc()
    ).offset(skip).limit(page_size).all()
    
    total = db.query(Notification).filter(
        Notification.user_id == current_user.id
    ).count()
    
    return NotificationListResponse(
        notifications=[NotificationResponse.model_validate(n) for n in notifications],
        total=total,
        page=page,
        page_size=page_size
    )


@router.put("/{notification_id}/read", response_model=NotificationResponse)
async def mark_notification_read(
    notification_id: int,
    current_user: User = Depends(get_current_user), 
    db: Session = Depends(get_db)
):
    """标记通知为已读"""
    notification = db.query(Notification).filter(
        Notification.id == notification_id,
        Notification.user_id == current_user.id
    ).first()
    
    if not notification:
        raise HTTPException(status_code=404, detail="通知不存在")
    
    notification.is_read = True
    db.commit()
    db.refresh(notification)
    
    return NotificationResponse.model_validate(notification)


@router.delete("/{notification_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_notification(
    notification_id: int,
    current_user: User = Depends(get_current_user), 
    db: Session = Depends(get_db)
):
    """删除通知"""
    notification = db.query(Notification).filter(
        Notification.id == notification_id,
        Notification.user_id == current_user.id
    ).first()
    
    if not notification:
        raise HTTPException(status_code=404, detail="通知不存在")
    
    db.delete(notification)
    db.commit()
    
    return None


def create_quality_check_notification(db: Session, user_id: int, project_name: str, project_id: int):
    """创建质检完成通知"""
    # 检查用户的通知设置
    notification_setting = db.query(NotificationSetting).filter(
        NotificationSetting.user_id == user_id
    ).first()
    
    # 如果用户没有通知设置，使用默认值（开启）
    # 不创建数据库记录，只有当用户明确修改时才创建
    quality_check_enabled = True
    if notification_setting:
        quality_check_enabled = notification_setting.quality_check_notification
    
    # 如果用户关闭了质检通知，则不创建通知
    if not quality_check_enabled:
        return None
    
    notification = Notification(
        user_id=user_id,
        title="质检完成通知",
        content=f"项目 '{project_name}' 质检已完成",
        type="quality_check",
        related_id=project_id
    )
    db.add(notification)
    db.commit()
    db.refresh(notification)
    
    # 通过WebSocket发送实时通知
    import asyncio
    notification_data = NotificationResponse.model_validate(notification)
    asyncio.create_task(
        manager.send_personal_message(
            {
                "type": "new_notification",
                "notification": notification_data.model_dump()
            },
            user_id
        )
    )
    
    return notification


@router.get("/settings", response_model=NotificationSettingResponse)
async def get_notification_settings(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """获取通知设置"""
    # 查找用户的通知设置
    notification_setting = db.query(NotificationSetting).filter(
        NotificationSetting.user_id == current_user.id
    ).first()
    
    # 如果没有设置，返回默认值
    if not notification_setting:
        return NotificationSettingResponse(
            id=0,  # 虚拟ID，实际不存在
            user_id=current_user.id,
            quality_check_notification=True
        )
    
    return NotificationSettingResponse.model_validate(notification_setting)


@router.put("/settings", response_model=NotificationSettingResponse)
async def update_notification_settings(
    setting_data: NotificationSettingUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """更新通知设置"""
    # 查找用户的通知设置
    notification_setting = db.query(NotificationSetting).filter(
        NotificationSetting.user_id == current_user.id
    ).first()
    
    # 如果没有设置，创建新设置
    if not notification_setting:
        notification_setting = NotificationSetting(
            user_id=current_user.id,
            **setting_data.model_dump()
        )
        db.add(notification_setting)
    else:
        # 更新现有设置
        for key, value in setting_data.model_dump().items():
            setattr(notification_setting, key, value)
    
    db.commit()
    db.refresh(notification_setting)
    
    return NotificationSettingResponse.model_validate(notification_setting)