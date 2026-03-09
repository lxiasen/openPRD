"""
统一错误码定义

错误码格式: XXXYYYZZZ
- XXX: 模块编号 (100-999)
- YYY: 功能编号 (001-999)
- ZZZ: 错误编号 (001-999)

模块编号分配:
- 100: 系统级错误
- 200: 认证授权模块
- 300: 用户模块
- 400: 项目模块
- 500: PRD模块
- 600: AI/LLM模块
"""

from enum import Enum
from typing import Optional, Dict, Any
from fastapi import HTTPException, status


class ErrorCode(Enum):
    """错误码枚举"""

    # ========== 系统级错误 (100xxx) ==========
    SUCCESS = ("000000", "操作成功", status.HTTP_200_OK)
    UNKNOWN_ERROR = ("100001", "未知错误", status.HTTP_500_INTERNAL_SERVER_ERROR)
    SYSTEM_ERROR = ("100002", "系统内部错误", status.HTTP_500_INTERNAL_SERVER_ERROR)
    DATABASE_ERROR = ("100003", "数据库操作失败", status.HTTP_500_INTERNAL_SERVER_ERROR)
    VALIDATION_ERROR = ("100004", "参数校验失败", status.HTTP_400_BAD_REQUEST)
    RATE_LIMIT_ERROR = ("100005", "请求过于频繁", status.HTTP_429_TOO_MANY_REQUESTS)
    SERVICE_UNAVAILABLE = ("100006", "服务暂不可用", status.HTTP_503_SERVICE_UNAVAILABLE)

    # ========== 认证授权模块 (200xxx) ==========
    # 登录相关 (2001xx)
    AUTH_INVALID_CREDENTIALS = ("200101", "用户名或密码错误", status.HTTP_401_UNAUTHORIZED)
    AUTH_TOKEN_EXPIRED = ("200102", "登录已过期，请重新登录", status.HTTP_401_UNAUTHORIZED)
    AUTH_TOKEN_INVALID = ("200103", "无效的认证令牌", status.HTTP_401_UNAUTHORIZED)
    AUTH_PERMISSION_DENIED = ("200104", "权限不足", status.HTTP_403_FORBIDDEN)
    AUTH_ACCOUNT_LOCKED = ("200105", "账户已被锁定", status.HTTP_403_FORBIDDEN)
    AUTH_ACCOUNT_DISABLED = ("200106", "账户已被禁用", status.HTTP_403_FORBIDDEN)

    # 注册相关 (2002xx)
    AUTH_USERNAME_EXISTS = ("200201", "用户名已被注册", status.HTTP_400_BAD_REQUEST)
    AUTH_EMAIL_EXISTS = ("200202", "邮箱已被注册", status.HTTP_400_BAD_REQUEST)
    AUTH_PASSWORD_TOO_WEAK = ("200203", "密码强度不足", status.HTTP_400_BAD_REQUEST)
    AUTH_INVALID_USERNAME = ("200204", "用户名格式不正确", status.HTTP_400_BAD_REQUEST)
    AUTH_INVALID_EMAIL = ("200205", "邮箱格式不正确", status.HTTP_400_BAD_REQUEST)

    # 密码相关 (2003xx)
    AUTH_PASSWORD_INCORRECT = ("200301", "当前密码不正确", status.HTTP_400_BAD_REQUEST)
    AUTH_PASSWORD_SAME = ("200302", "新密码不能与旧密码相同", status.HTTP_400_BAD_REQUEST)
    AUTH_RESET_TOKEN_INVALID = ("200303", "密码重置链接已失效", status.HTTP_400_BAD_REQUEST)
    AUTH_RESET_TOKEN_EXPIRED = ("200304", "密码重置链接已过期", status.HTTP_400_BAD_REQUEST)

    # ========== 用户模块 (300xxx) ==========
    USER_NOT_FOUND = ("300001", "用户不存在", status.HTTP_404_NOT_FOUND)
    USER_UPDATE_FAILED = ("300002", "用户信息更新失败", status.HTTP_500_INTERNAL_SERVER_ERROR)
    USER_DELETE_FAILED = ("300003", "用户删除失败", status.HTTP_500_INTERNAL_SERVER_ERROR)

    # ========== 项目模块 (400xxx) ==========
    PROJECT_NOT_FOUND = ("400001", "项目不存在", status.HTTP_404_NOT_FOUND)
    PROJECT_CREATE_FAILED = ("400002", "项目创建失败", status.HTTP_500_INTERNAL_SERVER_ERROR)
    PROJECT_UPDATE_FAILED = ("400003", "项目更新失败", status.HTTP_500_INTERNAL_SERVER_ERROR)
    PROJECT_DELETE_FAILED = ("400004", "项目删除失败", status.HTTP_500_INTERNAL_SERVER_ERROR)
    PROJECT_ACCESS_DENIED = ("400005", "无权访问该项目", status.HTTP_403_FORBIDDEN)
    PROJECT_NAME_EXISTS = ("400006", "项目名称已存在", status.HTTP_400_BAD_REQUEST)
    PROJECT_NAME_EMPTY = ("400007", "项目名称不能为空", status.HTTP_400_BAD_REQUEST)

    # ========== PRD模块 (500xxx) ==========
    PRD_NOT_FOUND = ("500001", "PRD文档不存在", status.HTTP_404_NOT_FOUND)
    PRD_UPLOAD_FAILED = ("500002", "PRD上传失败", status.HTTP_500_INTERNAL_SERVER_ERROR)
    PRD_PARSE_FAILED = ("500003", "PRD解析失败", status.HTTP_400_BAD_REQUEST)
    PRD_CONTENT_EMPTY = ("500004", "PRD内容不能为空", status.HTTP_400_BAD_REQUEST)
    PRD_FILE_TOO_LARGE = ("500005", "PRD文件过大", status.HTTP_413_REQUEST_ENTITY_TOO_LARGE)
    PRD_FILE_INVALID_TYPE = ("500006", "不支持的文件类型", status.HTTP_400_BAD_REQUEST)
    PRD_OPTIMIZE_FAILED = ("500007", "PRD优化失败", status.HTTP_500_INTERNAL_SERVER_ERROR)
    PRD_EXPORT_FAILED = ("500008", "PRD导出失败", status.HTTP_500_INTERNAL_SERVER_ERROR)
    PRD_VERSION_NOT_FOUND = ("500009", "PRD版本不存在", status.HTTP_404_NOT_FOUND)

    # ========== AI/LLM模块 (600xxx) ==========
    AI_SERVICE_ERROR = ("600001", "AI服务调用失败", status.HTTP_503_SERVICE_UNAVAILABLE)
    AI_TIMEOUT_ERROR = ("600002", "AI服务响应超时", status.HTTP_504_GATEWAY_TIMEOUT)
    AI_RATE_LIMIT = ("600003", "AI服务请求过于频繁", status.HTTP_429_TOO_MANY_REQUESTS)
    AI_CONTENT_FILTER = ("600004", "内容被AI安全过滤器拦截", status.HTTP_400_BAD_REQUEST)

    def __init__(self, code: str, message: str, status_code: int):
        self.code = code
        self.message = message
        self.status_code = status_code

    def to_dict(self) -> Dict[str, Any]:
        """转换为字典格式"""
        return {
            "code": self.code,
            "message": self.message,
            "status_code": self.status_code
        }


class BusinessException(HTTPException):
    """
    业务异常类

    使用示例:
        raise BusinessException(ErrorCode.AUTH_USERNAME_EXISTS)
        raise BusinessException(ErrorCode.PROJECT_NOT_FOUND, detail="项目ID 123 不存在")
        raise BusinessException(ErrorCode.VALIDATION_ERROR, detail={"field": "email", "error": "格式错误"})
    """

    def __init__(
        self,
        error_code: ErrorCode,
        detail: Optional[str] = None,
        headers: Optional[Dict[str, str]] = None,
        extra_data: Optional[Dict[str, Any]] = None
    ):
        self.error_code = error_code
        self.extra_data = extra_data or {}

        # 使用自定义 detail 或默认消息
        message = detail if detail is not None else error_code.message

        # 构造响应体
        self.response_body = {
            "success": False,
            "code": error_code.code,
            "message": message,
            "data": None
        }

        # 如果有额外数据，添加到响应中
        if extra_data:
            self.response_body["extra"] = extra_data

        super().__init__(
            status_code=error_code.status_code,
            detail=self.response_body,
            headers=headers
        )

    def to_response(self) -> Dict[str, Any]:
        """获取响应数据"""
        return self.response_body


class APIResponse:
    """
    统一 API 响应格式

    成功响应:
        {"success": true, "code": "000000", "message": "操作成功", "data": {...}}

    失败响应:
        {"success": false, "code": "200201", "message": "用户名已被注册", "data": null}
    """

    @staticmethod
    def success(data: Any = None, message: str = "操作成功") -> Dict[str, Any]:
        """成功响应"""
        return {
            "success": True,
            "code": ErrorCode.SUCCESS.code,
            "message": message,
            "data": data
        }

    @staticmethod
    def error(
        error_code: ErrorCode,
        detail: Optional[str] = None,
        extra_data: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """错误响应"""
        response = {
            "success": False,
            "code": error_code.code,
            "message": detail if detail is not None else error_code.message,
            "data": None
        }
        if extra_data:
            response["extra"] = extra_data
        return response
