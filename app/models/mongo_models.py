from pydantic import BaseModel, Field
from typing import List, Dict, Optional, Any
from datetime import datetime
from bson import ObjectId


class PyObjectId(ObjectId):
    """MongoDB ObjectId类型"""
    @classmethod
    def __get_validators__(cls):
        yield cls.validate

    @classmethod
    def validate(cls, v, info):
        if not ObjectId.is_valid(v):
            raise ValueError("Invalid objectid")
        return ObjectId(v)

    @classmethod
    def __get_pydantic_json_schema__(cls, schema, handler):
        schema.update(type="string")
        return schema


class BaseMongoModel(BaseModel):
    """MongoDB模型基类"""
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True
        json_encoders = {
            ObjectId: str,
            datetime: lambda v: v.isoformat()
        }


class PRDContent(BaseMongoModel):
    """PRD内容模型"""
    project_id: int  # 关联MySQL中的项目ID
    content: str  # PRD原文内容（Markdown格式）
    title: str  # PRD标题
    version: int = 1  # 版本号
    is_optimized: bool = False  # 是否为优化版

    class Config(BaseMongoModel.Config):
        collection_name = "prd_contents"


class PRDOptimized(BaseMongoModel):
    """优化版PRD模型"""
    project_id: int  # 关联MySQL中的项目ID
    original_prd_id: str  # 原始PRD的MongoDB ID
    content: str  # 优化后的PRD内容（Markdown格式）
    modifications: List[Dict[str, Any]] = []  # 修改记录
    version: int = 1  # 版本号

    class Config(BaseMongoModel.Config):
        collection_name = "prd_optimized"


class DiffItem(BaseModel):
    """差异项模型"""
    check_id: str  # 检查项ID
    original_content: str  # 原文内容
    optimized_content: str  # 优化后内容
    modification_type: str  # 修改类型（add/delete/modify）
    status: str = "pending"  # 状态（pending/accepted/rejected）


class PRDDiff(BaseMongoModel):
    """PRD差异对比模型"""
    project_id: int  # 关联MySQL中的项目ID
    original_prd_id: str  # 原始PRD的MongoDB ID
    optimized_prd_id: str  # 优化版PRD的MongoDB ID
    diff_items: List[DiffItem] = []  # 差异项列表
    accepted_count: int = 0  # 已接受的修改数
    rejected_count: int = 0  # 已拒绝的修改数

    class Config(BaseMongoModel.Config):
        collection_name = "prd_diffs"


class ExportRecord(BaseMongoModel):
    """导出记录模型"""
    project_id: int  # 关联MySQL中的项目ID
    export_format: str  # 导出格式（markdown/word/pdf/excel）
    export_time: datetime = Field(default_factory=datetime.utcnow)
    file_path: Optional[str] = None  # 导出文件路径
    status: str = "completed"  # 导出状态

    class Config(BaseMongoModel.Config):
        collection_name = "export_records"
