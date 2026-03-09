from pymongo.database import Database
from bson import ObjectId
from app.models.mongo_models import PRDContent, PRDOptimized
from typing import List, Optional, Dict, Any
from datetime import datetime


class MongoOperations:
    """MongoDB数据库操作类"""
    
    @staticmethod
    def create_prd_content(db: Database, project_id: int, content: str, title: str, version: int = 1) -> PRDContent:
        """创建PRD内容"""
        prd_content = PRDContent(
            project_id=project_id,
            content=content,
            title=title,
            version=version
        )
        
        collection = db[PRDContent.Config.collection_name]
        result = collection.insert_one(prd_content.model_dump(by_alias=True))
        prd_content.id = result.inserted_id
        return prd_content
    
    @staticmethod
    def get_prd_content_by_id(db: Database, prd_id: str) -> Optional[PRDContent]:
        """根据ID获取PRD内容"""
        collection = db[PRDContent.Config.collection_name]
        data = collection.find_one({"_id": ObjectId(prd_id)})
        if data:
            return PRDContent(**data)
        return None
    
    @staticmethod
    def get_prd_content_by_project_id(db: Database, project_id: int) -> Optional[PRDContent]:
        """根据项目ID获取PRD内容"""
        collection = db[PRDContent.Config.collection_name]
        data = collection.find_one({"project_id": project_id})
        if data:
            return PRDContent(**data)
        return None
    
    @staticmethod
    def update_prd_content(db: Database, prd_id: str, **kwargs) -> Optional[PRDContent]:
        """更新PRD内容"""
        collection = db[PRDContent.Config.collection_name]
        kwargs["updated_at"] = datetime.utcnow()
        result = collection.update_one(
            {"_id": ObjectId(prd_id)},
            {"$set": kwargs}
        )
        if result.modified_count > 0:
            return MongoOperations.get_prd_content_by_id(db, prd_id)
        return None
    
    @staticmethod
    def delete_prd_content(db: Database, prd_id: str) -> bool:
        """删除PRD内容"""
        collection = db[PRDContent.Config.collection_name]
        result = collection.delete_one({"_id": ObjectId(prd_id)})
        return result.deleted_count > 0
    
    @staticmethod
    def create_prd_optimized(db: Database, project_id: int, original_prd_id: str, title: str, content: str, version: int = 1) -> PRDOptimized:
        """创建优化版PRD"""
        prd_optimized = PRDOptimized(
            project_id=project_id,
            original_prd_id=original_prd_id,
            title=title,
            content=content,
            version=version
        )
        
        collection = db[PRDOptimized.Config.collection_name]
        result = collection.insert_one(prd_optimized.model_dump(by_alias=True))
        prd_optimized.id = result.inserted_id
        return prd_optimized
    
    @staticmethod
    def get_prd_optimized_by_id(db: Database, prd_id: str) -> Optional[PRDOptimized]:
        """根据ID获取优化版PRD"""
        collection = db[PRDOptimized.Config.collection_name]
        data = collection.find_one({"_id": ObjectId(prd_id)})
        if data:
            return PRDOptimized(**data)
        return None
    
    @staticmethod
    def get_prd_optimized_by_project_id(db: Database, project_id: int) -> Optional[PRDOptimized]:
        """根据项目ID获取优化版PRD"""
        collection = db[PRDOptimized.Config.collection_name]
        data = collection.find_one({"project_id": project_id})
        if data:
            return PRDOptimized(**data)
        return None
    
    @staticmethod
    def update_prd_optimized(db: Database, prd_id: str, **kwargs) -> Optional[PRDOptimized]:
        """更新优化版PRD"""
        collection = db[PRDOptimized.Config.collection_name]
        kwargs["updated_at"] = datetime.utcnow()
        result = collection.update_one(
            {"_id": ObjectId(prd_id)},
            {"$set": kwargs}
        )
        if result.modified_count > 0:
            return MongoOperations.get_prd_optimized_by_id(db, prd_id)
        return None
    
    @staticmethod
    def delete_prd_optimized(db: Database, prd_id: str) -> bool:
        """删除优化版PRD"""
        collection = db[PRDOptimized.Config.collection_name]
        result = collection.delete_one({"_id": ObjectId(prd_id)})
        return result.deleted_count > 0

    