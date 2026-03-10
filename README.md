# openPRD - 产品需求文档管理与优化平台

[English](README_EN.md) | [中文](README.md)

openPRD是一个专注于产品需求文档（PRD）管理、分析和优化的平台，帮助产品经理和开发团队更高效地创建、审查和改进PRD文档。

## ✨ 为什么选择 openPRD？

- 🎯 **专注PRD质量管理** - 专为PRD文档打造的质量检查与优化系统
- 🤖 **AI驱动的智能分析** - 基于大语言模型的PRD质量评估与优化建议
- 🔄 **实时版本对比** - 直观展示优化前后的差异
- 📦 **开箱即用** - 完整的用户系统、模板库、通知系统
- 🔌 **易于扩展** - 模块化设计，便于二次开发

## 📸 预览

![工作区](screenshots/workspace.png)

![项目详情](screenshots/project-detail.png)

![PRD编辑器](screenshots/prd-editor.png)

## 📋 功能特性

### 🏗️ 核心功能
- **用户认证系统**：支持用户注册、登录、密码重置
- **项目管理**：创建、编辑、删除PRD项目
- **PRD分析与优化**：基于AI的PRD质量检查和优化建议
- **模板管理**：提供PRD模板库，支持模板的创建、使用和管理
- **反馈系统**：用户可以提交建议、bug报告和功能请求
- **通知系统**：实时通知用户PRD分析结果和系统消息
- **WebSocket支持**：实时通信功能

### 🔧 技术特性
- **模块化设计**：清晰的目录结构，易于扩展
- **环境变量配置**：支持不同环境的配置管理
- **统一的日志管理**：详细的日志记录
- **请求上下文和日志中间件**：增强的请求处理
- **完善的错误处理**：统一的异常处理机制
- **CORS中间件配置**：支持跨域请求

## 🛠️ 技术栈

| 类别 | 技术 | 版本 |
|------|------|------|
| 后端框架 | FastAPI | 0.125.0 |
| 配置管理 | Pydantic Settings | 2.12.0 |
| 数据库 | MySQL | 最新 |
| NoSQL数据库 | MongoDB | 最新 |
| 认证 | JWT | 最新 |
| 前端框架 | React | 18.2.0 |
| 前端构建工具 | Vite | 5.1.0 |
| 状态管理 | Zustand | 5.0.11 |
| UI组件 | Headless UI | 2.2.9 |
| 编辑器 | React MD Editor | 4.0.11 |
| 动画库 | Framer Motion | 12.34.4 |
| 图标库 | Lucide React | 0.576.0 |

## 📁 项目结构

```
openPRD/
├── alembic/              # 数据库迁移工具
│   ├── versions/         # 迁移版本文件
│   ├── README
│   ├── env.py
│   └── script.py.mako
├── app/                  # 主应用目录
│   ├── api/              # API路由
│   │   ├── __init__.py
│   │   ├── auth.py       # 认证相关API
│   │   ├── feedback.py   # 反馈相关API
│   │   ├── notification.py # 通知相关API
│   │   ├── prd.py        # PRD相关API
│   │   ├── project.py    # 项目相关API
│   │   ├── template.py   # 模板相关API
│   │   └── websocket.py  # WebSocket相关API
│   ├── config/           # 配置管理
│   │   ├── __init__.py
│   │   └── settings.py   # 应用配置
│   ├── core/             # 核心功能
│   │   ├── __init__.py
│   │   ├── errors.py     # 错误定义
│   │   └── exception_handlers.py # 异常处理器
│   ├── database/         # 数据库操作
│   │   ├── __init__.py
│   │   ├── mongo_operations.py # MongoDB操作
│   │   └── mysql_operations.py # MySQL操作
│   ├── middleware_config/ # 中间件配置
│   │   └── middleware.py  # 自定义中间件
│   ├── models/           # 数据模型
│   │   ├── __init__.py
│   │   ├── auth_schemas.py # 认证相关模型
│   │   ├── feedback_schemas.py # 反馈相关模型
│   │   ├── mongo_models.py # MongoDB模型
│   │   ├── mysql_models.py # MySQL模型
│   │   ├── notification_schemas.py # 通知相关模型
│   │   ├── notification_setting_schemas.py # 通知设置模型
│   │   ├── prd_schemas.py # PRD相关模型
│   │   ├── project_schemas.py # 项目相关模型
│   │   └── template_schemas.py # 模板相关模型
│   ├── utils/            # 工具函数
│   │   ├── __init__.py
│   │   ├── json_utils.py # JSON工具
│   │   ├── llm_client.py # 大语言模型客户端
│   │   ├── logger.py     # 日志工具
│   │   ├── mongo_client.py # MongoDB客户端
│   │   ├── mysql_client.py # MySQL客户端
│   │   └── websocket_manager.py # WebSocket管理
│   ├── __init__.py
│   └── main.py           # 应用入口
├── frontend/             # 前端应用
│   ├── public/            # 静态资源
│   ├── src/               # 前端源码
│   │   ├── components/    # 组件
│   │   ├── pages/         # 页面
│   │   ├── services/      # 服务
│   │   ├── store/         # 状态管理
│   │   ├── styles/        # 样式
│   │   ├── utils/         # 工具函数
│   │   ├── App.css        # 应用样式
│   │   ├── App.jsx        # 应用组件
│   │   ├── main.jsx       # 应用入口
│   │   └── router.jsx     # 路由配置
│   ├── index.html         # HTML模板
│   ├── package-lock.json  # 前端依赖锁文件
│   ├── package.json       # 前端依赖
│   ├── postcss.config.cjs # PostCSS配置
│   └── vite.config.js     # Vite配置
├── .gitignore            # Git忽略文件
├── PRD撰写优化Prompt.md # PRD优化提示
├── PRD质量审核Prompt.md # PRD质量审核提示
├── README.md             # 项目说明
├── alembic.ini           # Alembic配置
└── requirements.txt      # Python依赖
```

## 🚀 快速开始

### 前提条件

- Python 3.12+
- Node.js 16+（用于前端开发）
- MySQL 8.0+
- MongoDB 4.0+

### 安装与配置

1. **克隆仓库**

```bash
git clone https://github.com/lxiasen/openPRD.git
cd openPRD
```

2. **配置环境变量**

在项目根目录创建 `.env` 文件

3. **安装后端依赖**

```bash
pip install -r requirements.txt
```

4. **安装前端依赖**

```bash
cd frontend
npm install
```

### 数据库初始化

1. **MySQL数据库初始化**

   - 确保MySQL服务已启动
   - 创建数据库 `openprd`
   - 运行数据库迁移：

```bash
# 生成迁移文件（如果需要）
alembic revision --autogenerate -m "Initial migration"

# 运行迁移
alembic upgrade head
```

2. **MongoDB数据库初始化**

   - 确保MongoDB服务已启动
   - MongoDB会在首次连接时自动创建数据库和集合

### 运行服务

**后端服务**

```bash
# 启动后端服务
uvicorn app.main:app --host 0.0.0.0 --reload
```

**前端服务**

```bash
cd frontend
npm run dev
```

服务将在以下地址可用：
- 后端API: `http://localhost:8000`
- Swagger文档: `http://localhost:8000/docs`
- 前端界面: `http://localhost:5173`

## 📖 使用指南

### 1. 用户认证

- **注册**：访问 `http://localhost:5173/register` 创建新账户
- **登录**：访问 `http://localhost:5173/login` 登录系统
- **忘记密码**：访问 `http://localhost:5173/forgot-password` 重置密码

### 2. 项目管理

- **创建项目**：在工作区页面点击"新建项目"按钮
- **编辑项目**：点击项目卡片进入项目详情页，可编辑项目信息
- **删除项目**：在项目详情页点击"删除项目"按钮

### 3. PRD管理

- **编辑PRD**：在项目详情页的"PRD编辑器"标签页中编辑PRD内容
- **分析PRD**：点击"分析PRD"按钮，系统会对PRD进行质量检查
- **查看质量报告**：在"质量报告"标签页查看分析结果和建议
- **查看优化PRD**：在"优化PRD"标签页查看系统优化后的PRD版本
- **比较差异**：在"差异比较"标签页查看原始PRD和优化PRD的差异
- **导出PRD**：点击"导出"按钮，可导出PRD为不同格式

### 4. 模板管理

- **浏览模板**：在工作区页面点击"模板库"按钮
- **使用模板**：选择模板后点击"使用模板"按钮创建新项目
- **搜索模板**：使用搜索框和分类筛选查找模板

### 5. 反馈系统

- **提交反馈**：访问 `http://localhost:5173/feedback` 提交反馈
- **选择反馈类型**：可以选择建议、bug、功能请求或其他类型

### 6. 通知系统

- **查看通知**：点击页面顶部的通知图标查看通知中心
- **设置通知**：在个人设置中配置通知偏好

## 🧪 测试

运行测试套件：

```bash
python -m unittest discover tests
```

## 📝 扩展建议

1. **添加更多AI分析功能**：增强PRD分析的深度和准确性
2. **添加团队协作功能**：支持多用户协作编辑PRD
3. **添加版本控制**：支持PRD的版本管理和回滚
4. **添加更多导出格式**：支持导出为Word、PDF等格式
5. **添加集成功能**：与其他项目管理工具集成
6. **添加API文档**：完善API文档，便于第三方集成
7. **添加性能优化**：优化系统性能，支持更大规模的PRD管理

## 🤝 贡献指南

欢迎贡献代码！请遵循以下步骤：

1. **Fork 本仓库**
2. **创建特性分支** (`git checkout -b feature/AmazingFeature`)
3. **提交更改** (`git commit -m 'Add some AmazingFeature'`)
4. **推送分支** (`git push origin feature/AmazingFeature`)
5. **创建 Pull Request**

### 开发规范

- 请确保代码符合项目的代码风格
- 提交前请测试您的更改
- 更新相关文档（如果需要）

## ⭐ 支持

如果这个项目对您有帮助，请给个 Star！

如果您发现了问题或有改进建议，欢迎：
- 提交 [Issue](https://github.com/lxiasen/openPRD/issues)
- 提交 Pull Request

## � 联系方式

- 项目主页：https://github.com/lxiasen/openPRD
- 问题反馈：https://github.com/lxiasen/openPRD/issues

## �� 许可证

本项目采用 MIT 许可证，详情请查看 [LICENSE](LICENSE) 文件。

---

<p align="center">
  <img src="https://img.shields.io/github/stars/lxiasen/openPRD?style=flat-square" alt="stars">
  <img src="https://img.shields.io/github/forks/lxiasen/openPRD?style=flat-square" alt="forks">
  <img src="https://img.shields.io/github/license/lxiasen/openPRD?style=flat-square" alt="license">
</p>