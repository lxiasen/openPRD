"""
PRD模板库API路由
提供模板列表、搜索、详情、下载等功能
"""
from fastapi import APIRouter, Depends, HTTPException, Query
from typing import Optional, List
from datetime import datetime

from app.models.template_schemas import (
    TemplateResponse, 
    TemplateListResponse, 
    TemplateListItem,
    TemplateSearchRequest,
    TemplateCategoryListResponse,
    TemplateCategory
)
from app.database.mysql_operations import MySQLOperations
from app.utils.mysql_client import get_db
from sqlalchemy.orm import Session
from app.utils.logger import get_logger

logger = get_logger(__name__)

router = APIRouter()

# 初始化模板数据（首次运行时执行）
def init_templates(db: Session):
    """初始化默认模板数据"""
    template_count = MySQLOperations.get_templates_count(db)
    if template_count == 0:
        logger.info("初始化默认模板数据")
        
        # 默认模板数据
        default_templates = [
            {
                "name": "电商APP产品需求文档",
                "description": "适用于电商类APP的PRD模板，包含商品、订单、支付等核心模块",
                "category": "移动应用",
                "tags": "电商,APP,移动端",
                "content": """# 电商APP产品需求文档

## 1. 产品概述

### 1.1 产品背景
本文档描述电商APP的产品需求，包括用户端、商家端和后台管理系统。

### 1.2 目标用户
- 消费者：18-45岁，有线上购物习惯
- 商家：中小型企业，有线上销售需求

## 2. 功能需求

### 2.1 用户端

#### 2.1.1 首页
- 轮播图展示
- 商品分类入口
- 推荐商品列表
- 搜索功能

#### 2.1.2 商品详情
- 商品图片展示
- 价格、库存信息
- 规格选择
- 加入购物车
- 立即购买

#### 2.1.3 购物车
- 商品列表展示
- 数量调整
- 选择结算
- 删除商品

#### 2.1.4 订单管理
- 订单列表
- 订单详情
- 订单状态跟踪
- 申请售后

### 2.2 商家端

#### 2.2.1 商品管理
- 商品发布
- 商品编辑
- 库存管理
- 价格管理

#### 2.2.2 订单处理
- 订单列表
- 发货管理
- 退款处理

## 3. 非功能需求

### 3.1 性能要求
- 页面加载时间 < 3秒
- 支持1000并发用户

### 3.2 安全要求
- 用户数据加密存储
- 支付安全认证
""",
                "created_by": "admin"
            },
            {
                "name": "SaaS后台管理系统PRD",
                "description": "企业级SaaS后台管理系统模板，包含权限、报表、配置管理等",
                "category": "Web应用",
                "tags": "SaaS,后台管理,B端",
                "content": """# SaaS后台管理系统PRD

## 1. 产品概述

### 1.1 产品定位
企业级SaaS后台管理系统，提供完整的权限管理、数据报表和系统配置功能。

### 1.2 用户角色
- 超级管理员
- 普通管理员
- 运营人员
- 财务人员

## 2. 功能模块

### 2.1 用户管理
- 用户列表
- 用户详情
- 用户权限分配
- 用户状态管理

### 2.2 角色权限
- 角色列表
- 权限配置
- 菜单权限
- 操作权限

### 2.3 数据报表
- 用户统计
- 业务报表
- 财务报表
- 自定义报表

### 2.4 系统配置
- 基础配置
- 邮件配置
- 短信配置
- 支付配置

## 3. 界面设计

### 3.1 布局
- 左侧导航栏
- 顶部操作栏
- 内容区域
- 底部信息栏

### 3.2 主题
- 支持亮色/暗色主题
- 支持主题色自定义
""",
                "created_by": "admin"
            },
            {
                "name": "社交APP功能需求文档",
                "description": "社交类APP产品需求文档，包含IM、动态、好友关系等核心功能",
                "category": "移动应用",
                "tags": "社交,IM,APP",
                "content": """# 社交APP功能需求文档

## 1. 产品概述

### 1.1 产品定位
面向年轻用户的社交APP，提供即时通讯、动态分享、兴趣社区等功能。

### 1.2 核心功能
- 即时通讯
- 朋友圈动态
- 兴趣群组
- 附近的人

## 2. 功能需求

### 2.1 即时通讯
- 文字消息
- 语音消息
- 图片/视频发送
- 表情包
- 消息撤回
- 已读回执

### 2.2 动态分享
- 发布动态
- 点赞评论
- 转发分享
- 动态权限

### 2.3 好友关系
- 添加好友
- 好友分组
- 好友备注
- 黑名单

### 2.4 个人中心
- 个人资料
- 我的动态
- 我的收藏
- 设置

## 3. 技术需求

### 3.1 实时性
- 消息投递 < 200ms
- 在线状态实时同步

### 3.2 多媒体
- 支持大文件传输
- 图片压缩优化
- 视频播放优化
""",
                "created_by": "admin"
            },
            {
                "name": "在线教育平台PRD",
                "description": "在线教育平台产品需求文档，包含课程、直播、作业等教育场景",
                "category": "Web应用",
                "tags": "教育,在线学习,直播",
                "content": """# 在线教育平台PRD

## 1. 产品概述

### 1.1 产品定位
综合性在线教育平台，支持录播课程、直播授课、在线考试等功能。

### 1.2 用户角色
- 学生
- 教师
- 家长
- 管理员

## 2. 功能模块

### 2.1 课程系统
- 课程分类
- 课程详情
- 课程购买
- 学习进度

### 2.2 直播系统
- 直播教室
- 互动白板
- 在线答题
- 录播回放

### 2.3 作业系统
- 作业发布
- 作业提交
- 作业批改
- 成绩统计

### 2.4 考试系统
- 题库管理
- 试卷组卷
- 在线考试
- 成绩分析

## 3. 特色功能

### 3.1 学习路径
- 个性化推荐
- 学习规划
- 能力评估

### 3.2 互动功能
- 讨论区
- 问答社区
- 学习小组
""",
                "created_by": "admin"
            },
            {
                "name": "金融理财APP需求文档",
                "description": "金融理财类APP产品需求，包含账户、交易、风控等金融核心功能",
                "category": "移动应用",
                "tags": "金融,理财,支付",
                "content": """# 金融理财APP需求文档

## 1. 产品概述

### 1.1 产品定位
安全、便捷的移动金融理财平台，提供账户管理、投资理财、支付转账等功能。

### 1.2 合规要求
- 符合金融监管要求
- 用户实名认证
- 交易风控体系

## 2. 核心功能

### 2.1 账户体系
- 注册登录
- 实名认证
- 账户安全
- 密码管理

### 2.2 资产管理
- 资产总览
- 收益分析
- 交易记录
- 账单查询

### 2.3 投资理财
- 理财产品
- 基金购买
- 定期存款
- 风险评估

### 2.4 支付转账
- 快捷支付
- 转账汇款
- 收款码
- 交易限额

## 3. 安全需求

### 3.1 认证体系
- 多因素认证
- 生物识别
- 设备绑定

### 3.2 风控体系
- 交易监控
- 异常预警
- 反欺诈
""",
                "created_by": "admin"
            },
            {
                "name": "内容管理系统(CMS)PRD",
                "description": "企业级内容管理系统，支持文章、媒体、栏目等内容管理",
                "category": "Web应用",
                "tags": "CMS,内容管理,企业网站",
                "content": """# 内容管理系统(CMS)PRD

## 1. 产品概述

### 1.1 产品定位
企业级内容管理系统，支持多站点、多渠道的内容发布和管理。

### 1.2 适用场景
- 企业官网
- 新闻门户
- 内容平台
- 知识库

## 2. 功能模块

### 2.1 内容管理
- 文章管理
- 栏目管理
- 标签管理
- 内容审核

### 2.2 媒体管理
- 图片库
- 视频库
- 文件管理
- 资源分类

### 2.3 发布管理
- 发布流程
- 定时发布
- 版本控制
- 内容回收站

### 2.4 站点管理
- 多站点支持
- 模板管理
- SEO设置
- 域名绑定

## 3. 扩展功能

### 3.1 工作流
- 审批流程
- 权限控制
- 操作日志

### 3.2 统计
- 访问统计
- 内容分析
- 用户行为
""",
                "created_by": "admin"
            }
        ]
        
        for template_data in default_templates:
            MySQLOperations.create_template(db, **template_data)
        
        logger.info(f"成功初始化 {len(default_templates)} 个模板")


@router.get("/templates", response_model=TemplateListResponse)
async def get_templates(
    page: int = Query(1, ge=1, description="页码"),
    page_size: int = Query(20, ge=1, le=100, description="每页数量"),
    category: Optional[str] = Query(None, description="分类筛选"),
    keyword: Optional[str] = Query(None, description="搜索关键词"),
    db: Session = Depends(get_db)
):
    """
    获取模板列表
    支持分页、分类筛选和关键词搜索
    """
    logger.info(f"获取模板列表: page={page}, page_size={page_size}, category={category}, keyword={keyword}")
    
    # 初始化模板数据（首次运行时）
    init_templates(db)
    
    # 计算偏移量
    skip = (page - 1) * page_size
    
    # 从数据库获取模板
    templates = MySQLOperations.get_templates(
        db, 
        skip=skip, 
        limit=page_size, 
        category=category, 
        keyword=keyword
    )
    
    # 获取总数
    total = MySQLOperations.get_templates_count(
        db, 
        category=category, 
        keyword=keyword
    )
    
    # 转换为列表项（不包含完整内容）
    template_list = [
        TemplateListItem(
            id=str(t.id),
            name=t.name,
            description=t.description,
            category=t.category,
            tags=t.tags_list,
            download_count=t.download_count,
            created_at=t.created_at
        )
        for t in templates
    ]
    
    return TemplateListResponse(
        templates=template_list,
        total=total,
        page=page,
        page_size=page_size
    )


@router.get("/templates/search", response_model=TemplateListResponse)
async def search_templates(
    keyword: Optional[str] = Query(None, description="搜索关键词"),
    category: Optional[str] = Query(None, description="分类筛选"),
    tags: Optional[List[str]] = Query(None, description="标签筛选"),
    page: int = Query(1, ge=1, description="页码"),
    page_size: int = Query(20, ge=1, le=100, description="每页数量"),
    db: Session = Depends(get_db)
):
    """
    搜索模板
    支持关键词、分类、标签组合搜索
    """
    logger.info(f"搜索模板: keyword={keyword}, category={category}, tags={tags}")
    
    # 初始化模板数据（首次运行时）
    init_templates(db)
    
    # 计算偏移量
    skip = (page - 1) * page_size
    
    # 从数据库获取模板
    # 注意：当前实现暂不支持标签筛选，后续可扩展
    templates = MySQLOperations.get_templates(
        db, 
        skip=skip, 
        limit=page_size, 
        category=category, 
        keyword=keyword
    )
    
    # 获取总数
    total = MySQLOperations.get_templates_count(
        db, 
        category=category, 
        keyword=keyword
    )
    
    # 转换为列表项
    template_list = [
        TemplateListItem(
            id=str(t.id),
            name=t.name,
            description=t.description,
            category=t.category,
            tags=t.tags_list,
            download_count=t.download_count,
            created_at=t.created_at
        )
        for t in templates
    ]
    
    return TemplateListResponse(
        templates=template_list,
        total=total,
        page=page,
        page_size=page_size
    )


@router.get("/templates/{template_id}", response_model=TemplateResponse)
async def get_template(template_id: str, db: Session = Depends(get_db)):
    """
    获取模板详情
    返回完整的模板内容
    """
    logger.info(f"获取模板详情: template_id={template_id}")
    
    # 初始化模板数据（首次运行时）
    init_templates(db)
    
    # 从数据库获取模板
    template = MySQLOperations.get_template_by_id(db, int(template_id))
    
    if not template:
        raise HTTPException(status_code=404, detail="模板不存在")
    
    # 转换为响应模型
    return TemplateResponse(
        id=str(template.id),
        name=template.name,
        description=template.description,
        category=template.category,
        tags=template.tags_list,
        content=template.content,
        download_count=template.download_count,
        created_at=template.created_at,
        updated_at=template.updated_at,
        created_by=template.created_by
    )


@router.get("/templates/{template_id}/download")
async def download_template(template_id: str, db: Session = Depends(get_db)):
    """
    下载模板
    返回模板文件内容，并增加下载次数
    """
    logger.info(f"下载模板: template_id={template_id}")
    
    # 初始化模板数据（首次运行时）
    init_templates(db)
    
    # 从数据库获取模板
    template = MySQLOperations.get_template_by_id(db, int(template_id))
    
    if not template:
        raise HTTPException(status_code=404, detail="模板不存在")
    
    # 增加下载次数
    updated_template = MySQLOperations.increment_download_count(db, int(template_id))
    
    # 返回文件内容
    return {
        "file_name": f"{template.name}.md",
        "content": template.content,
        "download_count": updated_template.download_count
    }


@router.get("/template-categories", response_model=TemplateCategoryListResponse)
async def get_template_categories(db: Session = Depends(get_db)):
    """
    获取模板分类列表
    返回所有分类及其模板数量
    """
    logger.info("获取模板分类列表")
    
    # 初始化模板数据（首次运行时）
    init_templates(db)
    
    # 从数据库获取分类
    categories_data = MySQLOperations.get_template_categories(db)
    
    # 构建分类列表
    categories = [
        TemplateCategory(
            id=str(idx + 1),
            name=cat["name"],
            count=cat["count"]
        )
        for idx, cat in enumerate(categories_data)
    ]
    
    return TemplateCategoryListResponse(categories=categories)


@router.get("/template-tags")
async def get_template_tags(db: Session = Depends(get_db)):
    """
    获取所有模板标签
    返回标签列表及其使用次数
    """
    logger.info("获取模板标签列表")
    
    # 初始化模板数据（首次运行时）
    init_templates(db)
    
    # 从数据库获取标签
    tags = MySQLOperations.get_template_tags(db)
    
    # 返回标签列表
    return {"tags": tags}
