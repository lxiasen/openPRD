from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    """应用配置类"""
    # 应用基本配置
    APP_NAME: str = "openPRD"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = True
    PORT: int = 8000

    # 数据库配置
    DATABASE_URL: str = ""
    MONGO_URL: str = ""
    MONGO_DB_NAME: str = "openprd"

    # JWT配置
    SECRET_KEY: str = ""
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    # Azure OpenAI配置
    AZURE_OPENAI_ENDPOINT: Optional[str] = None
    AZURE_OPENAI_API_KEY: Optional[str] = None
    AZURE_OPENAI_API_VERSION: Optional[str] = None
    AZURE_OPENAI_CHAT_DEPLOYMENT: Optional[str] = None
    AZURE_OPENAI_EMBED_DEPLOYMENT: Optional[str] = None

    class Config:
        env_file = ".env"
        case_sensitive = True
        extra = "allow"


# 创建配置实例
settings = Settings()
