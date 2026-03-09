"""
PRD相关API路由
"""
from fastapi import APIRouter, Depends, status, UploadFile, File, Form
from sqlalchemy.orm import Session
from pymongo.database import Database
from typing import Optional
import asyncio
import os
import tempfile
import time

from app.utils.mysql_client import get_db
from app.utils.mongo_client import get_mongo_db
from app.database.mysql_operations import MySQLOperations
from app.database.mongo_operations import MongoOperations
from app.models.mysql_models import User, Project, ProjectStatus
from app.models.prd_schemas import (
    PRDUpload,
    PRDContent,
    CheckItemResponse,
    CheckItemUpdateRequest,
    PRDOptimizeRequest
)
from app.api.auth import get_current_user
from app.api.notification import create_quality_check_notification
from app.utils.llm_client import LLMClient
from app.core.errors import BusinessException, ErrorCode
from app.utils.logger import get_logger
from app.utils.websocket_manager import manager
import asyncio

logger = get_logger(__name__)

router = APIRouter()


# 异步执行质量审核的函数（在子线程中运行）
def perform_quality_check(project_id: int, user_id: int):
    """异步执行质量审核（在子线程中运行）"""
    
    async def _do_quality_check():
        
        # 获取数据库客户端
        db = get_db()
        mongo_db = get_mongo_db()        
        try:
            # 获取项目信息
            project = MySQLOperations.get_project_by_id(db, project_id)
            if not project:
                # 发送失败通知
                await manager.send_personal_message(
                    {
                        "type": "quality_check_result",
                        "project_id": project_id,
                        "status": "error",
                        "message": "项目不存在"
                    },
                    user_id
                )
                return

            # 获取PRD内容
            prd_content = MongoOperations.get_prd_content_by_project_id(
                mongo_db, project_id
            )
            if not prd_content:
                # 发送失败通知
                await manager.send_personal_message(
                    {
                        "type": "quality_check_result",
                        "project_id": project_id,
                        "status": "error",
                        "message": "PRD内容不存在"
                    },
                    user_id
                )
                return

            # 调用LLM进行质量审核
            llm_client = LLMClient()
            check_result = await llm_client.check_prd_quality(prd_content.content)

            # 删除已有的历史检查结果
            MySQLOperations.delete_check_items_by_project_id(db, project_id)

            # 保存检查结果到MySQL
            check_items = []
            for i, item in enumerate(check_result, 1):
                check_id = f"CHECK-{i:03d}"
                check_item = MySQLOperations.create_check_item(
                    db=db,
                    project_id=project_id,
                    check_id=check_id,
                    dimension=item.get("问题维度", "未知"),
                    issue_description=item.get("模糊点描述", ""),
                    customer_question=item.get("客户提问", ""),
                    required_info=item.get("需补充明确的内容", ""),
                    suggestion=item.get("修改建议", "")
                )
                check_items.append(check_item)

            # 更新项目状态
            MySQLOperations.update_project(db, project_id, status=ProjectStatus.ANALYZED)

            # 转换检查结果为前端需要的格式
            check_items_response = [
                {
                    "id": item.id,
                    "check_id": item.check_id,
                    "dimension": item.dimension,
                    "issue_description": item.issue_description,
                    "customer_question": item.customer_question,
                    "required_info": item.required_info,
                    "suggestion": item.suggestion
                }
                for item in check_items
            ]

            # 发送成功通知
            await manager.send_personal_message(
                {
                    "type": "quality_check_result",
                    "project_id": project_id,
                    "status": "success",
                    "message": "质量审核完成",
                    "check_items": check_items_response
                },
                user_id
            )

            # 创建质检完成通知（通知中心）
            create_quality_check_notification(db, user_id, project.name, project_id)
        except Exception as e:
            # 记录错误
            logger.error(f"质量审核异步执行失败: {str(e)}")
            # 发送失败通知
            await manager.send_personal_message(
                {
                    "type": "quality_check_result",
                    "project_id": project_id,
                    "status": "error",
                    "message": f"质量审核失败: {str(e)}"
                },
                user_id
            )
        finally:
            # 关闭数据库会话
            if db:
                db.close()
    
    asyncio.run(_do_quality_check())


# PRD文件上传API
@router.post("/upload")
async def upload_prd(
    file: UploadFile = File(...),
    project_name: str = Form(""),
    description: Optional[str] = Form(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    mongo_db: Database = Depends(get_mongo_db)
):
    """上传PRD文件"""
    # 检查文件类型
    allowed_extensions = ['.txt', '.md', '.doc', '.docx']
    file_ext = os.path.splitext(file.filename)[1].lower()
    if file_ext not in allowed_extensions:
        raise BusinessException(
            ErrorCode.PRD_FILE_INVALID_TYPE,
            detail=f"不支持的文件类型: {file_ext}"
        )

    # 检查项目名称是否为空
    if not project_name.strip() and not file.filename:
        raise BusinessException(ErrorCode.PROJECT_NAME_EMPTY)

    try:
        # 读取文件内容
        content = await file.read()
        content_str = content.decode('utf-8')

        # 检查内容是否为空
        if not content_str.strip():
            raise BusinessException(ErrorCode.PRD_CONTENT_EMPTY)

        # 创建项目
        project = MySQLOperations.create_project(
            db=db,
            name=project_name or file.filename,
            description=description,
            user_id=current_user.id,
            status=ProjectStatus.CREATED
        )

        # 保存PRD内容到MongoDB
        prd_content = MongoOperations.create_prd_content(
            db=mongo_db,
            project_id=project.id,
            content=content_str,
            title=project_name or file.filename,
            version=1
        )

        # 更新项目的PRD原始ID
        MySQLOperations.update_project(db, project.id, prd_original_id=str(prd_content.id))

        return {
            "message": "PRD uploaded successfully",
            "project_id": project.id,
            "prd_id": str(prd_content.id)
        }
    except BusinessException:
        raise
    except Exception as e:
        raise BusinessException(
            ErrorCode.PRD_UPLOAD_FAILED,
            detail=str(e)
        )


# PRD质量审核API
@router.post("/quality-check/{project_id}")
async def quality_check(
    project_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    mongo_db: Database = Depends(get_mongo_db)
):
    """PRD质量审核"""
    # 检查项目是否存在
    project = MySQLOperations.get_project_by_id(db, project_id)
    if not project:
        raise BusinessException(ErrorCode.PROJECT_NOT_FOUND)

    # 检查项目是否属于当前用户
    if project.user_id != current_user.id:
        raise BusinessException(ErrorCode.PROJECT_ACCESS_DENIED)

    # 获取PRD内容
    prd_content = MongoOperations.get_prd_content_by_project_id(
        mongo_db, project_id
    )
    if not prd_content:
        raise BusinessException(ErrorCode.PRD_NOT_FOUND)

    # 启动异步任务（在子线程中运行）
    import asyncio
    
    asyncio.create_task(asyncio.to_thread(perform_quality_check, project_id, current_user.id))

    # 立即返回成功
    return {
        "message": "PRD质量审核已开始，结果将通过通知发送",
        "project_id": project_id
    }


# PRD优化API
@router.post("/optimize/{project_id}")
async def optimize_prd(
    project_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    mongo_db: Database = Depends(get_mongo_db)
):
    """PRD优化"""
    # 检查项目是否存在
    project = MySQLOperations.get_project_by_id(db, project_id)
    if not project:
        raise BusinessException(ErrorCode.PROJECT_NOT_FOUND)

    # 检查项目是否属于当前用户
    if project.user_id != current_user.id:
        raise BusinessException(ErrorCode.PROJECT_ACCESS_DENIED)

    # 获取PRD内容
    prd_content = MongoOperations.get_prd_content_by_project_id(
        mongo_db, project_id
    )
    if not prd_content:
        raise BusinessException(ErrorCode.PRD_NOT_FOUND)

    # 获取检查结果
    check_items = MySQLOperations.get_check_items_by_project_id(db, project_id)
    if not check_items:
        raise BusinessException(
            ErrorCode.VALIDATION_ERROR,
            detail="请先进行PRD质量审核"
        )

    try:
        # 调用LLM进行PRD优化
        llm_client = LLMClient()
        check_result = [
            {
                "问题维度": item.dimension,
                "模糊点描述": item.issue_description,
                "客户提问": item.customer_question,
                "需补充明确的内容": item.required_info,
                "修改建议": item.suggestion
            }
            for item in check_items
        ]
        optimized_content = await llm_client.optimize_prd(prd_content.content, check_result)

        # 保存优化版PRD到MongoDB
        prd_optimized = MongoOperations.create_prd_optimized(
            db=mongo_db,
            project_id=project_id,
            original_prd_id=str(prd_content.id),
            title=prd_content.title,
            content=optimized_content,
            version=1
        )

        # 更新项目的PRD优化ID和状态
        MySQLOperations.update_project(
            db,
            project_id,
            prd_optimized_id=str(prd_optimized.id),
            status=ProjectStatus.OPTIMIZED
        )

        return {
            "message": "PRD optimized successfully",
            "project_id": project_id,
            "optimized_prd_id": str(prd_optimized.id)
        }
    except BusinessException:
        raise
    except Exception as e:
        raise BusinessException(
            ErrorCode.PRD_OPTIMIZE_FAILED,
            detail=str(e)
        )

# 获取PRD内容API
@router.get("/content/{project_id}/{prd_id}")
async def get_prd_content(
    project_id: int,
    prd_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    mongo_db: Database = Depends(get_mongo_db)
):
    """获取PRD内容"""
    # 检查项目是否存在
    project = MySQLOperations.get_project_by_id(db, project_id)
    if not project:
        raise BusinessException(ErrorCode.PROJECT_NOT_FOUND)

    # 检查项目是否属于当前用户
    if project.user_id != current_user.id:
        raise BusinessException(ErrorCode.PROJECT_ACCESS_DENIED)

    # 检查prd_id是否属于当前项目
    if prd_id not in [project.prd_original_id, project.prd_optimized_id]:
        raise BusinessException(
            ErrorCode.PRD_NOT_FOUND,
            detail="PRD ID与项目不匹配"
        )

    # 获取PRD内容
    if prd_id == project.prd_original_id:
        prd_content = MongoOperations.get_prd_content_by_id(
            mongo_db, prd_id
        )
    else:
        prd_content = MongoOperations.get_prd_optimized_by_id(
            mongo_db, prd_id
        )

    if not prd_content:
        raise BusinessException(ErrorCode.PRD_NOT_FOUND)

    return {
        "project_id": project_id,
        "prd_id": prd_id,
        "content": prd_content.content,
        "title": prd_content.title
    }

# 获取检查项列表API
@router.get("/check-items/{project_id}")
async def get_check_items(
    project_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """获取项目的检查项列表"""
    # 检查项目是否存在
    project = MySQLOperations.get_project_by_id(db, project_id)
    if not project:
        raise BusinessException(ErrorCode.PROJECT_NOT_FOUND)

    # 检查项目是否属于当前用户
    if project.user_id != current_user.id:
        raise BusinessException(ErrorCode.PROJECT_ACCESS_DENIED)

    # 获取检查项
    check_items = MySQLOperations.get_check_items_by_project_id(db, project_id)
    
    # 转换为响应格式
    check_items_response = [
        {
            "id": item.id,
            "check_id": item.check_id,
            "dimension": item.dimension,
            "issue_description": item.issue_description,
            "customer_question": item.customer_question,
            "required_info": item.required_info,
            "suggestion": item.suggestion
        }
        for item in check_items
    ]

    return {
        "project_id": project_id,
        "check_items": check_items_response
    }


# 修改检查项API
@router.put("/check-items/{check_item_id}")
async def update_check_item(
    check_item_id: int,
    request: CheckItemUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """修改检查项"""
    # 获取检查项
    check_item = MySQLOperations.get_check_item_by_id(db, check_item_id)
    if not check_item:
        raise BusinessException(ErrorCode.PRD_NOT_FOUND, detail="检查项不存在")

    # 检查项目是否属于当前用户
    project = MySQLOperations.get_project_by_id(db, check_item.project_id)
    if not project:
        raise BusinessException(ErrorCode.PROJECT_NOT_FOUND)
    if project.user_id != current_user.id:
        raise BusinessException(ErrorCode.PROJECT_ACCESS_DENIED)

    # 更新检查项
    updated_check_item = MySQLOperations.update_check_item(
        db=db,
        check_item_id=check_item_id,
        dimension=request.dimension,
        issue_description=request.issue_description,
        customer_question=request.customer_question,
        required_info=request.required_info,
        suggestion=request.suggestion
    )

    # 转换为响应格式
    return {
        "id": updated_check_item.id,
        "check_id": updated_check_item.check_id,
        "dimension": updated_check_item.dimension,
        "issue_description": updated_check_item.issue_description,
        "customer_question": updated_check_item.customer_question,
        "required_info": updated_check_item.required_info,
        "suggestion": updated_check_item.suggestion
    }


# 删除检查项API
@router.delete("/check-items/{check_item_id}")
async def delete_check_item(
    check_item_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """删除检查项"""
    # 获取检查项
    check_item = MySQLOperations.get_check_item_by_id(db, check_item_id)
    if not check_item:
        raise BusinessException(ErrorCode.PRD_NOT_FOUND, detail="检查项不存在")

    # 检查项目是否属于当前用户
    project = MySQLOperations.get_project_by_id(db, check_item.project_id)
    if not project:
        raise BusinessException(ErrorCode.PROJECT_NOT_FOUND)
    if project.user_id != current_user.id:
        raise BusinessException(ErrorCode.PROJECT_ACCESS_DENIED)

    # 删除检查项
    MySQLOperations.delete_check_item(db, check_item_id)

    return {
        "message": "检查项删除成功",
        "check_item_id": check_item_id
    }
