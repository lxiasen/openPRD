from pymongo.database import Database
from bson import ObjectId
from app.models.mongo_models import PRDContent, PRDOptimized, PRDDiff, ExportRecord, DiffItem
from typing import List, Optional, Dict, Any
from datetime import datetime


class MongoOperations:
    """MongoDB数据库操作类"""
    
    @staticmethod
    def create_prd_content(db: Database, project_id: int, content: str, title: str, version: int = 1, is_optimized: bool = False) -> PRDContent:
        """创建PRD内容"""
        prd_content = PRDContent(
            project_id=project_id,
            content=content,
            title=title,
            version=version,
            is_optimized=is_optimized
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
    def get_prd_content_by_project_id(db: Database, project_id: int, is_optimized: bool = False) -> Optional[PRDContent]:
        """根据项目ID获取PRD内容"""
        collection = db[PRDContent.Config.collection_name]
        data = collection.find_one({"project_id": project_id, "is_optimized": is_optimized})
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
    def create_prd_optimized(db: Database, project_id: int, original_prd_id: str, content: str, modifications: List[Dict[str, Any]] = None, version: int = 1) -> PRDOptimized:
        """创建优化版PRD"""
        prd_optimized = PRDOptimized(
            project_id=project_id,
            original_prd_id=original_prd_id,
            content=content,
            modifications=modifications or [],
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
    
    @staticmethod
    def create_prd_diff(db: Database, project_id: int, original_prd_id: str, optimized_prd_id: str, diff_items: List[DiffItem] = None) -> PRDDiff:
        """创建PRD差异对比"""
        prd_diff = PRDDiff(
            project_id=project_id,
            original_prd_id=original_prd_id,
            optimized_prd_id=optimized_prd_id,
            diff_items=diff_items or []
        )
        
        collection = db[PRDDiff.Config.collection_name]
        result = collection.insert_one(prd_diff.model_dump(by_alias=True))
        prd_diff.id = result.inserted_id
        return prd_diff
    
    @staticmethod
    def get_prd_diff_by_id(db: Database, diff_id: str) -> Optional[PRDDiff]:
        """根据ID获取PRD差异对比"""
        collection = db[PRDDiff.Config.collection_name]
        data = collection.find_one({"_id": ObjectId(diff_id)})
        if data:
            return PRDDiff(**data)
        return None
    
    @staticmethod
    def get_prd_diff_by_project_id(db: Database, project_id: int) -> Optional[PRDDiff]:
        """根据项目ID获取PRD差异对比"""
        collection = db[PRDDiff.Config.collection_name]
        data = collection.find_one({"project_id": project_id})
        if data:
            return PRDDiff(**data)
        return None
    
    @staticmethod
    def update_prd_diff(db: Database, diff_id: str, **kwargs) -> Optional[PRDDiff]:
        """更新PRD差异对比"""
        collection = db[PRDDiff.Config.collection_name]
        kwargs["updated_at"] = datetime.utcnow()
        result = collection.update_one(
            {"_id": ObjectId(diff_id)},
            {"$set": kwargs}
        )
        if result.modified_count > 0:
            return MongoOperations.get_prd_diff_by_id(db, diff_id)
        return None
    
    @staticmethod
    def update_diff_item_status(db: Database, diff_id: str, item_index: int, status: str) -> Optional[PRDDiff]:
        """更新差异项状态"""
        collection = db[PRDDiff.Config.collection_name]
        result = collection.update_one(
            {"_id": ObjectId(diff_id)},
            {"$set": {f"diff_items.{item_index}.status": status}}
        )
        if result.modified_count > 0:
            # 更新统计计数
            diff = MongoOperations.get_prd_diff_by_id(db, diff_id)
            if diff:
                accepted_count = sum(1 for item in diff.diff_items if item.status == "accepted")
                rejected_count = sum(1 for item in diff.diff_items if item.status == "rejected")
                return MongoOperations.update_prd_diff(db, diff_id, accepted_count=accepted_count, rejected_count=rejected_count)
        return None
    
    @staticmethod
    def delete_prd_diff(db: Database, diff_id: str) -> bool:
        """删除PRD差异对比"""
        collection = db[PRDDiff.Config.collection_name]
        result = collection.delete_one({"_id": ObjectId(diff_id)})
        return result.deleted_count > 0
    
    @staticmethod
    def create_export_record(db: Database, project_id: int, export_format: str, file_path: Optional[str] = None, status: str = "completed") -> ExportRecord:
        """创建导出记录"""
        export_record = ExportRecord(
            project_id=project_id,
            export_format=export_format,
            file_path=file_path,
            status=status
        )
        
        collection = db[ExportRecord.Config.collection_name]
        result = collection.insert_one(export_record.model_dump(by_alias=True))
        export_record.id = result.inserted_id
        return export_record
    
    @staticmethod
    def get_export_records_by_project_id(db: Database, project_id: int) -> List[ExportRecord]:
        """根据项目ID获取导出记录列表"""
        collection = db[ExportRecord.Config.collection_name]
        records = collection.find({"project_id": project_id}).sort("export_time", -1)
        return [ExportRecord(**record) for record in records]
    
    @staticmethod
    def delete_export_record(db: Database, record_id: str) -> bool:
        """删除导出记录"""
        collection = db[ExportRecord.Config.collection_name]
        result = collection.delete_one({"_id": ObjectId(record_id)})
        return result.deleted_count > 0
