"""
认证API路由
"""
from fastapi import APIRouter, Depends, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from jose import JWTError, jwt
from passlib.context import CryptContext
import os

from app.utils.mysql_client import get_db
from app.database.mysql_operations import MySQLOperations
from app.models.mysql_models import User
from app.models.auth_schemas import (
    UserCreate,
    UserResponse,
    Token,
    RegisterResponse,
    TokenData,
    PasswordReset,
    PasswordUpdate,
    UserUpdate,
    PasswordChange,
)
from app.core.errors import BusinessException, ErrorCode

router = APIRouter()

# 密码加密上下文
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# OAuth2密码流
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")

# JWT密钥
SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30


# 密码工具函数
def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password):
    return pwd_context.hash(password)


# JWT工具函数
def create_access_token(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def verify_token(token: str):
    """验证JWT token并返回payload"""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        return None


async def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise BusinessException(
                ErrorCode.AUTH_TOKEN_INVALID,
                headers={"WWW-Authenticate": "Bearer"}
            )
        token_data = TokenData(username=username)
    except JWTError:
        raise BusinessException(
            ErrorCode.AUTH_TOKEN_EXPIRED,
            headers={"WWW-Authenticate": "Bearer"}
        )
    user = MySQLOperations.get_user_by_username(db, username=token_data.username)
    if user is None:
        raise BusinessException(
            ErrorCode.USER_NOT_FOUND,
            headers={"WWW-Authenticate": "Bearer"}
        )
    return user


# 认证API端点
@router.post("/register", response_model=RegisterResponse)
async def register(user: UserCreate, db: Session = Depends(get_db)):
    """用户注册"""
    # 检查用户名是否已存在
    existing_user = MySQLOperations.get_user_by_username(db, user.username)
    if existing_user:
        raise BusinessException(ErrorCode.AUTH_USERNAME_EXISTS)

    # 检查邮箱是否已存在
    existing_email = MySQLOperations.get_user_by_email(db, user.email)
    if existing_email:
        raise BusinessException(ErrorCode.AUTH_EMAIL_EXISTS)

    # 创建新用户
    hashed_password = get_password_hash(user.password)
    new_user = MySQLOperations.create_user(
        db=db,
        username=user.username,
        email=user.email,
        password_hash=hashed_password
    )

    # 生成token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": new_user.username}, expires_delta=access_token_expires
    )

    return RegisterResponse(
        access_token=access_token,
        token_type="bearer",
        user=UserResponse(
            id=new_user.id,
            username=new_user.username,
            email=new_user.email,
            role=new_user.role
        )
    )


@router.post("/login", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    """用户登录"""
    user = MySQLOperations.get_user_by_username(db, form_data.username)
    if not user or not verify_password(form_data.password, user.password_hash):
        raise BusinessException(ErrorCode.AUTH_INVALID_CREDENTIALS)

    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}


@router.post("/reset-password")
async def reset_password(reset_data: PasswordReset, db: Session = Depends(get_db)):
    """重置密码请求"""
    # 检查邮箱是否存在
    user = MySQLOperations.get_user_by_email(db, reset_data.email)
    if not user:
        raise BusinessException(ErrorCode.USER_NOT_FOUND)

    # 生成重置令牌（实际应用中应该发送邮件）
    reset_token = create_access_token(data={"sub": user.username}, expires_delta=timedelta(hours=1))

    # 这里应该发送邮件给用户，包含重置链接
    # 为了演示，直接返回令牌
    return {"message": "Reset password email sent", "token": reset_token}


@router.post("/update-password")
async def update_password(update_data: PasswordUpdate, db: Session = Depends(get_db)):
    """更新密码"""
    try:
        # 验证令牌
        payload = jwt.decode(update_data.token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise BusinessException(ErrorCode.AUTH_RESET_TOKEN_INVALID)

        # 检查用户是否存在
        user = MySQLOperations.get_user_by_email(db, update_data.email)
        if not user:
            raise BusinessException(ErrorCode.USER_NOT_FOUND)

        # 更新密码
        hashed_password = get_password_hash(update_data.new_password)
        MySQLOperations.update_user(db, user.id, password_hash=hashed_password)

        return {"message": "Password updated successfully"}
    except JWTError:
        raise BusinessException(ErrorCode.AUTH_RESET_TOKEN_EXPIRED)


@router.get("/me", response_model=UserResponse)
async def get_current_user_info(current_user: User = Depends(get_current_user)):
    """获取当前用户信息"""
    return UserResponse(
        id=current_user.id,
        username=current_user.username,
        email=current_user.email,
        role=current_user.role
    )


@router.put("/me", response_model=UserResponse)
async def update_user_info(
    user_update: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """更新当前用户信息"""
    if user_update.bio is not None:
        current_user.bio = user_update.bio

    db.commit()
    db.refresh(current_user)

    return UserResponse(
        id=current_user.id,
        username=current_user.username,
        email=current_user.email,
        role=current_user.role
    )


@router.post("/change-password")
async def change_password(
    password_change: PasswordChange,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """修改当前用户密码"""
    # 验证当前密码
    if not verify_password(password_change.current_password, current_user.password_hash):
        raise BusinessException(ErrorCode.AUTH_PASSWORD_INCORRECT)

    # 更新密码
    hashed_password = get_password_hash(password_change.new_password)
    MySQLOperations.update_user(db, current_user.id, password_hash=hashed_password)

    return {"message": "Password changed successfully"}
