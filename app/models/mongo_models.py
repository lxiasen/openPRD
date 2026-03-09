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

    class Config(BaseMongoModel.Config):
        collection_name = "prd_contents"


class PRDOptimized(BaseMongoModel):
    """优化版PRD模型"""
    project_id: int  # 关联MySQL中的项目ID
    original_prd_id: str  # 原始PRD的MongoDB ID
    title: str  # PRD标题
    content: str  # 优化后的PRD内容（Markdown格式）
    version: int = 1  # 版本号

    class Config(BaseMongoModel.Config):
        collection_name = "prd_optimized"
