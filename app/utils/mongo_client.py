from pymongo import MongoClient
from app.config import settings
from typing import Optional, Dict, Any, List
from app.utils.logger import get_logger
from functools import lru_cache

logger = get_logger(__name__)

class MongoDBClient:
    def __init__(self):
        logger.info(f"连接到MongoDB: {settings.MONGO_URL}")
        self.client = MongoClient(settings.MONGO_URL)
        self.db = self.client[settings.MONGO_DB_NAME]
        logger.debug("MongoDB客户端初始化完成")
    
    def close(self):
        logger.info("关闭MongoDB连接")
        self.client.close()
    
    def get_collection(self, collection_name: str):
        """获取集合"""
        logger.debug(f"获取集合: {collection_name}")
        return self.db[collection_name]
    
    def insert_one(self, collection_name: str, document: Dict[str, Any]) -> Any:
        """插入单个文档"""
        logger.debug(f"插入文档到集合 {collection_name}: {document}")
        try:
            result = self.db[collection_name].insert_one(document)
            logger.debug(f"文档插入成功，ID: {result.inserted_id}")
            return result.inserted_id
        except Exception as e:
            logger.error(f"文档插入失败: {str(e)}")
            logger.error(f"失败的文档: {document}")
            raise
    
    def insert_many(self, collection_name: str, documents: List[Dict[str, Any]]) -> List[Any]:
        """插入多个文档"""
        logger.debug(f"插入 {len(documents)} 个文档到集合 {collection_name}")
        try:
            result = self.db[collection_name].insert_many(documents)
            logger.debug(f"{len(result.inserted_ids)} 个文档插入成功")
            return result.inserted_ids
        except Exception as e:
            logger.error(f"批量插入失败: {str(e)}")
            raise
    
    def find_one(self, collection_name: str, filter_dict: Optional[Dict[str, Any]] = None, projection: Optional[Dict[str, Any]] = None) -> Optional[Dict[str, Any]]:
        """查找单个文档"""
        logger.debug(f"查找文档: 集合={collection_name}, 过滤={filter_dict}, 投影={projection}")
        try:
            result = self.db[collection_name].find_one(filter_dict, projection)
            logger.debug(f"查找结果: {'找到' if result else '未找到'}")
            return result
        except Exception as e:
            logger.error(f"查找失败: {str(e)}")
            logger.error(f"失败的查询: 过滤={filter_dict}, 投影={projection}")
            raise
    
    def find(self, collection_name: str, filter_dict: Optional[Dict[str, Any]] = None, projection: Optional[Dict[str, Any]] = None, 
             sort: Optional[List[tuple]] = None, skip: int = 0, limit: Optional[int] = None) -> List[Dict[str, Any]]:
        """查找多个文档"""
        logger.debug(f"查找多个文档: 集合={collection_name}, 过滤={filter_dict}, 投影={projection}, 排序={sort}, 跳过={skip}, 限制={limit}")
        try:
            query = self.db[collection_name].find(filter_dict, projection)
            if sort:
                query = query.sort(sort)
            if skip > 0:
                query = query.skip(skip)
            if limit:
                query = query.limit(limit)
            result = list(query)
            logger.debug(f"查找结果: {len(result)} 条记录")
            return result
        except Exception as e:
            logger.error(f"批量查找失败: {str(e)}")
            raise
    
    def update_one(self, collection_name: str, filter_dict: Dict[str, Any], update_dict: Dict[str, Any], upsert: bool = False) -> Any:
        """更新单个文档"""
        logger.debug(f"更新文档: 集合={collection_name}, 过滤={filter_dict}, 更新={update_dict}, upsert={upsert}")
        try:
            result = self.db[collection_name].update_one(filter_dict, update_dict, upsert=upsert)
            logger.debug(f"更新结果: 匹配={result.matched_count}, 修改={result.modified_count}, 插入={1 if result.upserted_id else 0}")
            return result
        except Exception as e:
            logger.error(f"文档更新失败: {str(e)}")
            logger.error(f"失败的更新: 过滤={filter_dict}, 更新={update_dict}")
            raise
    
    def update_many(self, collection_name: str, filter_dict: Dict[str, Any], update_dict: Dict[str, Any], upsert: bool = False) -> Any:
        """更新多个文档"""
        logger.debug(f"更新多个文档: 集合={collection_name}, 过滤={filter_dict}, 更新={update_dict}, upsert={upsert}")
        try:
            result = self.db[collection_name].update_many(filter_dict, update_dict, upsert=upsert)
            logger.debug(f"批量更新结果: 匹配={result.matched_count}, 修改={result.modified_count}")
            return result
        except Exception as e:
            logger.error(f"批量更新失败: {str(e)}")
            raise
    
    def delete_one(self, collection_name: str, filter_dict: Dict[str, Any]) -> Any:
        """删除单个文档"""
        logger.debug(f"删除文档: 集合={collection_name}, 过滤={filter_dict}")
        try:
            result = self.db[collection_name].delete_one(filter_dict)
            logger.debug(f"删除结果: 删除={result.deleted_count}")
            return result
        except Exception as e:
            logger.error(f"文档删除失败: {str(e)}")
            logger.error(f"失败的删除: 过滤={filter_dict}")
            raise
    
    def delete_many(self, collection_name: str, filter_dict: Dict[str, Any]) -> Any:
        """删除多个文档"""
        logger.debug(f"删除多个文档: 集合={collection_name}, 过滤={filter_dict}")
        try:
            result = self.db[collection_name].delete_many(filter_dict)
            logger.debug(f"批量删除结果: 删除={result.deleted_count}")
            return result
        except Exception as e:
            logger.error(f"批量删除失败: {str(e)}")
            raise

@lru_cache()
def get_mongo_client() -> MongoDBClient:
    """获取MongoDB客户端单例
    
    Returns:
        MongoDBClient: MongoDB数据库客户端实例
    """
    return MongoDBClient()


def get_mongo_db():
    """获取MongoDB数据库的依赖项函数"""
    return get_mongo_client().db