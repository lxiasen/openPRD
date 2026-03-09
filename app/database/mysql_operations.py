from sqlalchemy.orm import Session
from app.models.mysql_models import User, Project, CheckItem, Template, ProjectStatus
from typing import List, Optional


class MySQLOperations:
    """MySQL数据库操作类"""
    
    @staticmethod
    def create_user(db: Session, username: str, email: str, password_hash: str, role: str = "user") -> User:
        """创建用户"""
        user = User(
            username=username,
            email=email,
            password_hash=password_hash,
            role=role
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        return user
    
    @staticmethod
    def get_user_by_id(db: Session, user_id: int) -> Optional[User]:
        """根据ID获取用户"""
        return db.query(User).filter(User.id == user_id).first()
    
    @staticmethod
    def get_user_by_username(db: Session, username: str) -> Optional[User]:
        """根据用户名获取用户"""
        return db.query(User).filter(User.username == username).first()
    
    @staticmethod
    def get_user_by_email(db: Session, email: str) -> Optional[User]:
        """根据邮箱获取用户"""
        return db.query(User).filter(User.email == email).first()
    
    @staticmethod
    def get_users(db: Session, skip: int = 0, limit: int = 100) -> List[User]:
        """获取用户列表"""
        return db.query(User).offset(skip).limit(limit).all()
    
    @staticmethod
    def update_user(db: Session, user_id: int, **kwargs) -> Optional[User]:
        """更新用户信息"""
        user = db.query(User).filter(User.id == user_id).first()
        if user:
            for key, value in kwargs.items():
                setattr(user, key, value)
            db.commit()
            db.refresh(user)
        return user
    
    @staticmethod
    def delete_user(db: Session, user_id: int) -> bool:
        """删除用户"""
        user = db.query(User).filter(User.id == user_id).first()
        if user:
            db.delete(user)
            db.commit()
            return True
        return False
    
    @staticmethod
    def create_project(db: Session, name: str, description: Optional[str] = None, user_id: int = None, status: ProjectStatus = ProjectStatus.CREATED) -> Project:
        """创建项目"""
        project = Project(
            name=name,
            description=description,
            user_id=user_id,
            status=status
        )
        db.add(project)
        db.commit()
        db.refresh(project)
        return project
    
    @staticmethod
    def get_project_by_id(db: Session, project_id: int) -> Optional[Project]:
        """根据ID获取项目"""
        return db.query(Project).filter(Project.id == project_id).first()
    
    @staticmethod
    def get_projects_by_user_id(db: Session, user_id: int, skip: int = 0, limit: int = 100) -> List[Project]:
        """根据用户ID获取项目列表"""
        return db.query(Project).filter(Project.user_id == user_id).offset(skip).limit(limit).all()
    
    @staticmethod
    def get_all_projects(db: Session, skip: int = 0, limit: int = 100) -> List[Project]:
        """获取所有项目"""
        return db.query(Project).offset(skip).limit(limit).all()
    
    @staticmethod
    def update_project(db: Session, project_id: int, **kwargs) -> Optional[Project]:
        """更新项目信息"""
        project = db.query(Project).filter(Project.id == project_id).first()
        if project:
            for key, value in kwargs.items():
                setattr(project, key, value)
            db.commit()
            db.refresh(project)
        return project
    
    @staticmethod
    def delete_project(db: Session, project_id: int) -> bool:
        """删除项目"""
        project = db.query(Project).filter(Project.id == project_id).first()
        if project:
            db.delete(project)
            db.commit()
            return True
        return False
    
    @staticmethod
    def create_check_item(db: Session, project_id: int, check_id: str, dimension: str, issue_description: str, 
                        customer_question: str, required_info: str, suggestion: str, risk_level: str = "medium") -> CheckItem:
        """创建检查项"""
        check_item = CheckItem(
            project_id=project_id,
            check_id=check_id,
            dimension=dimension,
            issue_description=issue_description,
            customer_question=customer_question,
            required_info=required_info,
            suggestion=suggestion,
            risk_level=risk_level
        )
        db.add(check_item)
        db.commit()
        db.refresh(check_item)
        return check_item
    
    @staticmethod
    def get_check_item_by_id(db: Session, check_item_id: int) -> Optional[CheckItem]:
        """根据ID获取检查项"""
        return db.query(CheckItem).filter(CheckItem.id == check_item_id).first()
    
    @staticmethod
    def get_check_items_by_project_id(db: Session, project_id: int) -> List[CheckItem]:
        """根据项目ID获取检查项列表"""
        return db.query(CheckItem).filter(CheckItem.project_id == project_id).all()
    
    @staticmethod
    def update_check_item(db: Session, check_item_id: int, **kwargs) -> Optional[CheckItem]:
        """更新检查项信息"""
        check_item = db.query(CheckItem).filter(CheckItem.id == check_item_id).first()
        if check_item:
            for key, value in kwargs.items():
                setattr(check_item, key, value)
            db.commit()
            db.refresh(check_item)
        return check_item
    
    @staticmethod
    def delete_check_item(db: Session, check_item_id: int) -> bool:
        """删除检查项"""
        check_item = db.query(CheckItem).filter(CheckItem.id == check_item_id).first()
        if check_item:
            db.delete(check_item)
            db.commit()
            return True
        return False
    
    @staticmethod
    def delete_check_items_by_project_id(db: Session, project_id: int) -> bool:
        """删除指定项目的所有检查项"""
        try:
            db.query(CheckItem).filter(CheckItem.project_id == project_id).delete()
            db.commit()
            return True
        except Exception as e:
            db.rollback()
            return False
    
    @staticmethod
    def create_template(db: Session, name: str, description: Optional[str] = None, category: Optional[str] = None, tags: Optional[str] = None, content: Optional[str] = None, created_by: Optional[str] = None) -> Template:
        """创建模板"""
        template = Template(
            name=name,
            description=description,
            category=category,
            tags=tags,
            content=content,
            created_by=created_by
        )
        db.add(template)
        db.commit()
        db.refresh(template)
        return template
    
    @staticmethod
    def get_template_by_id(db: Session, template_id: int) -> Optional[Template]:
        """根据ID获取模板"""
        return db.query(Template).filter(Template.id == template_id).first()
    
    @staticmethod
    def get_templates(db: Session, skip: int = 0, limit: int = 20, category: Optional[str] = None, keyword: Optional[str] = None) -> List[Template]:
        """获取模板列表，支持分类筛选和关键词搜索"""
        query = db.query(Template)
        
        if category:
            query = query.filter(Template.category == category)
        
        if keyword:
            keyword = f"%{keyword}%"
            query = query.filter(
                (Template.name.like(keyword)) |
                (Template.description.like(keyword)) |
                (Template.tags.like(keyword))
            )
        
        return query.offset(skip).limit(limit).all()
    
    @staticmethod
    def get_templates_count(db: Session, category: Optional[str] = None, keyword: Optional[str] = None) -> int:
        """获取模板总数"""
        query = db.query(Template)
        
        if category:
            query = query.filter(Template.category == category)
        
        if keyword:
            keyword = f"%{keyword}%"
            query = query.filter(
                (Template.name.like(keyword)) |
                (Template.description.like(keyword)) |
                (Template.tags.like(keyword))
            )
        
        return query.count()
    
    @staticmethod
    def increment_download_count(db: Session, template_id: int) -> Optional[Template]:
        """增加模板下载次数"""
        template = db.query(Template).filter(Template.id == template_id).first()
        if template:
            template.download_count += 1
            db.commit()
            db.refresh(template)
        return template
    
    @staticmethod
    def get_template_categories(db: Session) -> List[dict]:
        """获取模板分类列表及其数量"""
        from sqlalchemy import func
        
        result = db.query(
            Template.category,
            func.count(Template.id).label('count')
        ).group_by(Template.category).all()
        
        categories = []
        for cat, count in result:
            if cat:
                categories.append({
                    'name': cat,
                    'count': count
                })
        
        return categories
    
    @staticmethod
    def get_template_tags(db: Session) -> List[dict]:
        """获取模板标签列表及其使用次数"""
        templates = db.query(Template).all()
        tag_count = {}
        
        for template in templates:
            if template.tags:
                tags = [tag.strip() for tag in template.tags.split(',')]
                for tag in tags:
                    if tag:
                        tag_count[tag] = tag_count.get(tag, 0) + 1
        
        tags = [{'name': tag, 'count': count} for tag, count in tag_count.items()]
        tags.sort(key=lambda x: x['count'], reverse=True)
        
        return tags
    
    @staticmethod
    def get_project_stats_by_user_id(db: Session, user_id: int) -> dict:
        """获取用户的项目统计数据"""
        from sqlalchemy import func
        from datetime import datetime, timedelta
        
        # 计算本周开始日期
        today = datetime.now()
        week_start = today - timedelta(days=today.weekday())
        week_start = week_start.replace(hour=0, minute=0, second=0, microsecond=0)
        
        # 总项目数
        total_projects = db.query(func.count(Project.id)).filter(Project.user_id == user_id).scalar() or 0
        
        # 进行中项目数（CREATED 或 ANALYZED 状态）
        in_progress_projects = db.query(func.count(Project.id)).filter(
            Project.user_id == user_id,
            Project.status.in_([ProjectStatus.CREATED, ProjectStatus.ANALYZED])
        ).scalar() or 0
        
        # 已完成项目数（OPTIMIZED 或 EXPORTED 状态）
        completed_projects = db.query(func.count(Project.id)).filter(
            Project.user_id == user_id,
            Project.status.in_([ProjectStatus.OPTIMIZED, ProjectStatus.EXPORTED])
        ).scalar() or 0
        
        # 本周新增项目数
        weekly_new_projects = db.query(func.count(Project.id)).filter(
            Project.user_id == user_id,
            Project.created_at >= week_start
        ).scalar() or 0
        
        return {
            'total_projects': total_projects,
            'in_progress_projects': in_progress_projects,
            'completed_projects': completed_projects,
            'weekly_new_projects': weekly_new_projects
        }
