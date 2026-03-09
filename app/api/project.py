"""
项目管理API路由
"""
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from pymongo.database import Database

from app.utils.mysql_client import get_db
from app.utils.mongo_client import get_mongo_db
from app.database.mysql_operations import MySQLOperations
from app.database.mongo_operations import MongoOperations
from app.models.mysql_models import User, Project, ProjectStatus
from app.models.project_schemas import (
    ProjectUpdate,
    ProjectResponse,
    ProjectListResponse,
)
from app.api.auth import get_current_user
from app.core.errors import BusinessException, ErrorCode
from app.utils.logger import get_logger

logger = get_logger(__name__)

router = APIRouter()


@router.get("", response_model=ProjectListResponse)
async def get_projects(
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """获取用户的项目列表"""
    try:
        # 获取用户的项目
        projects = MySQLOperations.get_projects_by_user_id(db, current_user.id, skip, limit)

        # 转换为响应格式
        project_responses = [
            ProjectResponse(
                id=project.id,
                name=project.name,
                description=project.description,
                status=project.status,
                user_id=project.user_id,
                prd_original_id=project.prd_original_id,
                prd_optimized_id=project.prd_optimized_id,
                created_at=project.created_at.isoformat(),
                updated_at=project.updated_at.isoformat()
            )
            for project in projects
        ]

        # 计算总项目数
        # 注意：实际项目中应该使用count()查询
        total = len(projects)

        return ProjectListResponse(
            projects=project_responses,
            total=total
        )
    except Exception as e:
        logger.error(f"获取项目列表失败: {str(e)}")
        raise BusinessException(
            ErrorCode.DATABASE_ERROR,
            detail=f"获取项目列表失败: {str(e)}"
        )


@router.get("/{project_id}", response_model=ProjectResponse)
async def get_project(
    project_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """获取项目详情"""
    # 检查项目是否存在
    project = MySQLOperations.get_project_by_id(db, project_id)
    if not project:
        raise BusinessException(ErrorCode.PROJECT_NOT_FOUND)

    # 检查项目是否属于当前用户
    if project.user_id != current_user.id:
        raise BusinessException(ErrorCode.PROJECT_ACCESS_DENIED)

    return ProjectResponse(
        id=project.id,
        name=project.name,
        description=project.description,
        status=project.status,
        user_id=project.user_id,
        prd_original_id=project.prd_original_id,
        prd_optimized_id=project.prd_optimized_id,
        created_at=project.created_at.isoformat(),
        updated_at=project.updated_at.isoformat()
    )


@router.put("/{project_id}", response_model=ProjectResponse)
async def update_project(
    project_id: int,
    project_update: ProjectUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """更新项目信息"""
    # 检查项目是否存在
    project = MySQLOperations.get_project_by_id(db, project_id)
    if not project:
        raise BusinessException(ErrorCode.PROJECT_NOT_FOUND)

    # 检查项目是否属于当前用户
    if project.user_id != current_user.id:
        raise BusinessException(ErrorCode.PROJECT_ACCESS_DENIED)

    # 检查项目名称是否为空
    if project_update.name is not None and not project_update.name.strip():
        raise BusinessException(ErrorCode.PROJECT_NAME_EMPTY)

    # 准备更新数据
    update_data = {}
    if project_update.name is not None:
        update_data["name"] = project_update.name
    if project_update.description is not None:
        update_data["description"] = project_update.description
    if project_update.status is not None:
        update_data["status"] = project_update.status

    try:
        # 更新项目
        updated_project = MySQLOperations.update_project(db, project_id, **update_data)

        return ProjectResponse(
            id=updated_project.id,
            name=updated_project.name,
            description=updated_project.description,
            status=updated_project.status,
            user_id=updated_project.user_id,
            prd_original_id=updated_project.prd_original_id,
            prd_optimized_id=updated_project.prd_optimized_id,
            created_at=updated_project.created_at.isoformat(),
            updated_at=updated_project.updated_at.isoformat()
        )
    except Exception as e:
        raise BusinessException(
            ErrorCode.PROJECT_UPDATE_FAILED,
            detail=str(e)
        )


@router.delete("/{project_id}")
async def delete_project(
    project_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    mongo_db: Database = Depends(get_mongo_db)
):
    """删除项目"""
    # 检查项目是否存在
    project = MySQLOperations.get_project_by_id(db, project_id)
    if not project:
        raise BusinessException(ErrorCode.PROJECT_NOT_FOUND)

    # 检查项目是否属于当前用户
    if project.user_id != current_user.id:
        raise BusinessException(ErrorCode.PROJECT_ACCESS_DENIED)

    try:
        # 删除相关的PRD内容
        if project.prd_original_id:
            MongoOperations.delete_prd_content(mongo_db, project.prd_original_id)
        if project.prd_optimized_id:
            MongoOperations.delete_prd_optimized(mongo_db, project.prd_optimized_id)

        # 删除项目的检查项
        check_items = MySQLOperations.get_check_items_by_project_id(db, project_id)
        for item in check_items:
            MySQLOperations.delete_check_item(db, item.id)

        # 删除项目
        MySQLOperations.delete_project(db, project_id)

        return {"message": "Project deleted successfully"}
    except Exception as e:
        raise BusinessException(
            ErrorCode.PROJECT_DELETE_FAILED,
            detail=str(e)
        )


@router.get("/stats/summary")
async def get_project_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """获取项目统计数据"""
    try:
        stats = MySQLOperations.get_project_stats_by_user_id(db, current_user.id)
        return stats
    except Exception as e:
        raise BusinessException(
            ErrorCode.DATABASE_ERROR,
            detail=f"获取统计数据失败: {str(e)}"
        )
