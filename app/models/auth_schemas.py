"""
认证相关的Pydantic模型
"""
from pydantic import BaseModel, Field, EmailStr
from typing import Optional


class UserCreate(BaseModel):
    """用户创建模型"""
    username: str = Field(..., min_length=3, max_length=50, description="用户名")
    email: EmailStr = Field(..., description="邮箱地址")
    password: str = Field(..., min_length=6, description="密码")


class UserLogin(BaseModel):
    """用户登录模型"""
    username: str = Field(..., min_length=3, max_length=50, description="用户名")
    password: str = Field(..., min_length=6, description="密码")


class UserResponse(BaseModel):
    """用户响应模型"""
    id: int
    username: str
    email: str
    role: str


class Token(BaseModel):
    """Token响应模型"""
    access_token: str
    token_type: str


class RegisterResponse(BaseModel):
    """注册响应模型"""
    access_token: str
    token_type: str
    user: UserResponse


class TokenData(BaseModel):
    """Token数据模型"""
    username: Optional[str] = None


class PasswordReset(BaseModel):
    """密码重置请求模型"""
    email: EmailStr = Field(..., description="邮箱地址")


class PasswordUpdate(BaseModel):
    """密码更新模型"""
    email: EmailStr = Field(..., description="邮箱地址")
    new_password: str = Field(..., min_length=6, description="新密码")
    token: str = Field(..., description="重置令牌")


class UserUpdate(BaseModel):
    """用户信息更新模型"""
    bio: Optional[str] = Field(None, max_length=500, description="个人简介")


class PasswordChange(BaseModel):
    """密码修改模型"""
    current_password: str = Field(..., min_length=6, description="当前密码")
    new_password: str = Field(..., min_length=6, description="新密码")
