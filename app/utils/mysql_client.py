from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from app.config import settings
from typing import Generator
from app.utils.logger import get_logger
from functools import lru_cache

logger = get_logger(__name__)

# 创建SQLAlchemy引擎
# 连接字符串格式: mysql+pymysql://用户名:密码@主机:端口/数据库名
# 优化连接池配置，增加连接池容量以应对WebSocket长连接
engine = create_engine(
    settings.DATABASE_URL, 
    pool_pre_ping=True, 
    pool_recycle=3600, 
    echo=settings.DEBUG,
    pool_size=20,  # 增加连接池大小
    max_overflow=10,  # 增加最大溢出连接数
    pool_timeout=60  # 增加连接超时时间
)

# 创建模型基类，所有SQLAlchemy模型都将继承自这个基类
Base = declarative_base()


class MySQLClient:
    """MySQL数据库客户端类"""
    
    def __init__(self):
        """初始化MySQL客户端"""
        # 创建会话工厂，用于创建数据库会话
        # autocommit=False: 关闭自动提交
        # autoflush=False: 关闭自动刷新
        # bind=engine: 绑定到创建的引擎
        self._session_local = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    
    def get_db(self) -> Generator[Session, None, None]:
        """
        获取数据库会话的生成器函数
        用于FastAPI的依赖注入系统，自动管理会话生命周期
        """
        db = self._session_local()
        try:
            # 提供会话给调用方
            yield db
        finally:
            # 确保会话被关闭，释放资源
            db.close()
    
    def create_session(self) -> Session:
        """创建一个新的数据库会话"""
        return self._session_local()
    
    def create_all_tables(self) -> None:
        """创建所有数据库表"""
        logger.info("创建所有数据库表")
        try:
            Base.metadata.create_all(bind=engine)
            logger.info("所有数据库表创建完成")
        except Exception as e:
            logger.error(f"创建数据库表失败: {str(e)}")
            raise
    
    def drop_all_tables(self) -> None:
        """删除所有数据库表"""
        logger.info("删除所有数据库表")
        try:
            Base.metadata.drop_all(bind=engine)
            logger.info("所有数据库表删除完成")
        except Exception as e:
            logger.error(f"删除数据库表失败: {str(e)}")
            raise

@lru_cache()
def get_mysql_client() -> MySQLClient:
    """获取MySQL客户端单例
    
    Returns:
        MySQLClient: MySQL数据库客户端实例
    """
    return MySQLClient()


# 依赖注入函数
def get_db() -> Generator[Session, None, None]:
    """获取数据库会话的依赖项函数"""
    return next(get_mysql_client().get_db())