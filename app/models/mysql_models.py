from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Enum, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from app.utils.mysql_client import Base


class ProjectStatus(str, enum.Enum):
    """项目状态枚举"""
    CREATED = "created"
    ANALYZED = "analyzed"
    OPTIMIZED = "optimized"
    EXPORTED = "exported"


class BaseMySQLModel(Base):
    """MySQL模型基类"""
    __abstract__ = True
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), server_default=func.now())


class User(BaseMySQLModel):
    """用户表"""
    __tablename__ = "users"
    
    username = Column(String(50), unique=True, index=True, nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    bio = Column(Text)
    role = Column(String(20), default="user")
    
    # 关系
    projects = relationship("Project", back_populates="user")
    notifications = relationship("Notification", back_populates="user")
    notification_setting = relationship("NotificationSetting", back_populates="user", uselist=False)


class Project(BaseMySQLModel):
    """项目表"""
    __tablename__ = "projects"
    
    name = Column(String(255), nullable=False)
    description = Column(Text)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    status = Column(Enum(ProjectStatus), default=ProjectStatus.CREATED)
    prd_original_id = Column(String(50))  # MongoDB中原始PRD的ID
    prd_optimized_id = Column(String(50))  # MongoDB中优化版PRD的ID
    
    # 关系
    user = relationship("User", back_populates="projects")
    check_items = relationship("CheckItem", back_populates="project")


class CheckItem(BaseMySQLModel):
    """检查项表"""
    __tablename__ = "check_items"
    
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    check_id = Column(String(20), nullable=False)  # CHECK-001格式
    dimension = Column(String(100), nullable=False)  # 问题维度
    issue_description = Column(Text, nullable=False)  # 模糊点描述
    customer_question = Column(Text, nullable=False)  # 客户提问
    required_info = Column(Text, nullable=False)  # 需补充明确的内容
    suggestion = Column(Text, nullable=False)  # 修改建议
    
    # 关系
    project = relationship("Project", back_populates="check_items")


class Template(BaseMySQLModel):
    """PRD模板表"""
    __tablename__ = "templates"
    
    name = Column(String(100), nullable=False, index=True)
    description = Column(Text)
    category = Column(String(50), index=True)
    tags = Column(Text)  # 存储为逗号分隔的标签
    content = Column(Text, nullable=False)
    download_count = Column(Integer, default=0)
    created_by = Column(String(50))
    
    @property
    def tags_list(self):
        """将tags字符串转换为列表"""
        if self.tags:
            return [tag.strip() for tag in self.tags.split(',')]
        return []
    
    @tags_list.setter
    def tags_list(self, value):
        """将列表转换为tags字符串"""
        if isinstance(value, list):
            self.tags = ','.join(value)
        else:
            self.tags = value


class FeedbackType(str, enum.Enum):
    """反馈类型枚举"""
    SUGGESTION = "suggestion"
    BUG = "bug"
    FEATURE = "feature"
    OTHER = "other"


class Feedback(BaseMySQLModel):
    """反馈表"""
    __tablename__ = "feedbacks"
    
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    type = Column(Enum(FeedbackType), default=FeedbackType.SUGGESTION)
    title = Column(String(255), nullable=False)
    content = Column(Text, nullable=False)
    contact = Column(String(100))  # 联系方式（邮箱或手机号）
    
    # 关系
    user = relationship("User")


class Notification(BaseMySQLModel):
    """通知模型"""
    __tablename__ = "notifications"
    
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String(255), nullable=False)
    content = Column(Text, nullable=False)
    type = Column(String(50), nullable=False)  # quality_check
    is_read = Column(Boolean, default=False)
    related_id = Column(Integer, nullable=True)  # 关联的项目ID
    
    # 关系
    user = relationship("User", back_populates="notifications")


class NotificationSetting(BaseMySQLModel):
    """通知设置模型"""
    __tablename__ = "notification_settings"
    
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    quality_check_notification = Column(Boolean, default=True)  # 质检完成通知
    
    # 关系
    user = relationship("User", back_populates="notification_setting")
