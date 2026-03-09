import sys
import os

# 添加项目根目录到Python路径
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from app.api import auth, prd, project, template, feedback, notification
from app.api.websocket import router as websocket_router
from app.config import settings
from app.middleware_config.middleware import RequestLoggingMiddleware
from app.core.exception_handlers import register_exception_handlers
from app.utils.logger import get_logger

logger = get_logger(__name__)

app = FastAPI(
    title=settings.APP_NAME,
    description="openPRD API",
    version=settings.APP_VERSION,
    docs_url="/docs",
    redoc_url="/redoc"
)

# 注册全局异常处理器
register_exception_handlers(app)

# 添加CORS中间件
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 添加请求日志记录中间件
app.add_middleware(RequestLoggingMiddleware)

# 包含API路由
app.include_router(auth.router, prefix="/api/v1/auth", tags=["Authentication"])
app.include_router(prd.router, prefix="/api/v1/prd", tags=["PRD"])
app.include_router(project.router, prefix="/api/v1/projects", tags=["Projects"])
app.include_router(template.router, prefix="/api/v1", tags=["Templates"])
app.include_router(feedback.router, prefix="/api/v1", tags=["Feedback"])
app.include_router(notification.router, prefix="/api/v1", tags=["Notifications"])
app.include_router(websocket_router)

# 根路径
@app.get("/")
def read_root():
    return {"message": "Welcome to openPRD API", "version": settings.APP_VERSION}

if __name__ == "__main__":
    logger.info("启动openPRD服务")
    logger.debug(f"服务配置: DEBUG={settings.DEBUG}, PORT={settings.PORT}")
    uvicorn.run(
        "app.main:app",  # 指定应用实例路径（模块路径:实例名）
        reload=True,     # 开启热重载（开发模式专属）
        host="127.0.0.1",# 主机（默认127.0.0.1，改为0.0.0.0可局域网访问）
        port=settings.PORT        # 端口（默认8080）
    )