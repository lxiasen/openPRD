from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.utils.mysql_client import get_db
from app.database.mysql_operations import MySQLOperations
from app.models.mysql_models import Feedback, FeedbackType
from app.models.feedback_schemas import FeedbackCreate, FeedbackResponse, FeedbackListResponse
from app.api.auth import get_current_user
from app.models.mysql_models import User
from app.core.errors import ErrorCode, BusinessException
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/feedback", tags=["feedback"])


@router.get("", response_model=FeedbackListResponse)
async def get_feedbacks(
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """获取当前用户的反馈列表"""
    try:
        feedbacks = db.query(Feedback).filter(
            Feedback.user_id == current_user.id
        ).order_by(Feedback.created_at.desc()).offset(skip).limit(limit).all()
        
        feedback_responses = [
            FeedbackResponse(
                id=feedback.id,
                user_id=feedback.user_id,
                type=feedback.type,
                title=feedback.title,
                content=feedback.content,
                contact=feedback.contact or "",
                created_at=feedback.created_at.isoformat(),
                updated_at=feedback.updated_at.isoformat()
            )
            for feedback in feedbacks
        ]
        
        total = db.query(Feedback).filter(Feedback.user_id == current_user.id).count()
        
        return FeedbackListResponse(
            feedbacks=feedback_responses,
            total=total
        )
    except Exception as e:
        logger.error(f"获取反馈列表失败: {str(e)}")
        raise BusinessException(
            ErrorCode.DATABASE_ERROR,
            detail=f"获取反馈列表失败: {str(e)}"
        )


@router.post("", response_model=FeedbackResponse, status_code=status.HTTP_201_CREATED)
async def create_feedback(
    feedback_data: FeedbackCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """创建反馈"""
    try:
        feedback = Feedback(
            user_id=current_user.id,
            type=feedback_data.type,
            title=feedback_data.title,
            content=feedback_data.content,
            contact=feedback_data.contact
        )
        
        db.add(feedback)
        db.commit()
        db.refresh(feedback)
        
        return FeedbackResponse(
            id=feedback.id,
            user_id=feedback.user_id,
            type=feedback.type,
            title=feedback.title,
            content=feedback.content,
            contact=feedback.contact or "",
            created_at=feedback.created_at.isoformat(),
            updated_at=feedback.updated_at.isoformat()
        )
    except Exception as e:
        db.rollback()
        logger.error(f"创建反馈失败: {str(e)}")
        raise BusinessException(
            ErrorCode.DATABASE_ERROR,
            detail=f"创建反馈失败: {str(e)}"
        )


@router.delete("/{feedback_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_feedback(
    feedback_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """删除反馈"""
    try:
        feedback = db.query(Feedback).filter(Feedback.id == feedback_id).first()
        
        if not feedback:
            raise BusinessException(ErrorCode.PROJECT_NOT_FOUND)
        
        if feedback.user_id != current_user.id:
            raise BusinessException(ErrorCode.PROJECT_ACCESS_DENIED)
        
        db.delete(feedback)
        db.commit()
        
        return None
    except BusinessException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"删除反馈失败: {str(e)}")
        raise BusinessException(
            ErrorCode.DATABASE_ERROR,
            detail=f"删除反馈失败: {str(e)}"
        )
