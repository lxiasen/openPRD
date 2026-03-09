"""
全局异常处理器

统一处理应用中的各种异常，返回标准格式的错误响应
"""

from fastapi import Request, status
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException
import traceback

from app.core.errors import ErrorCode, BusinessException, APIResponse
from app.utils.logger import get_logger

logger = get_logger(__name__)


async def business_exception_handler(request: Request, exc: BusinessException) -> JSONResponse:
    """
    处理业务异常

    返回统一格式的错误响应，包含错误码和可读的错误消息
    """
    # 记录错误日志
    logger.warning(
        f"BusinessException: {exc.error_code.code} - {exc.error_code.message} | "
        f"Path: {request.url.path} | "
        f"Method: {request.method}"
    )

    return JSONResponse(
        status_code=exc.status_code,
        content=exc.response_body
    )


async def http_exception_handler(request: Request, exc: StarletteHTTPException) -> JSONResponse:
    """
    处理标准 HTTP 异常

    将 FastAPI/Starlette 的 HTTPException 转换为统一格式
    """
    # 如果已经是 BusinessException 的格式，直接返回
    if isinstance(exc.detail, dict) and "code" in exc.detail:
        return JSONResponse(
            status_code=exc.status_code,
            content=exc.detail
        )

    # 根据状态码映射到对应的错误码
    error_mapping = {
        status.HTTP_400_BAD_REQUEST: ErrorCode.VALIDATION_ERROR,
        status.HTTP_401_UNAUTHORIZED: ErrorCode.AUTH_INVALID_CREDENTIALS,
        status.HTTP_403_FORBIDDEN: ErrorCode.AUTH_PERMISSION_DENIED,
        status.HTTP_404_NOT_FOUND: ErrorCode.UNKNOWN_ERROR,
        status.HTTP_429_TOO_MANY_REQUESTS: ErrorCode.RATE_LIMIT_ERROR,
        status.HTTP_500_INTERNAL_SERVER_ERROR: ErrorCode.SYSTEM_ERROR,
    }

    error_code = error_mapping.get(exc.status_code, ErrorCode.UNKNOWN_ERROR)

    # 记录错误日志
    logger.warning(
        f"HTTPException: {exc.status_code} - {exc.detail} | "
        f"Path: {request.url.path} | "
        f"Method: {request.method}"
    )

    return JSONResponse(
        status_code=exc.status_code,
        content=APIResponse.error(error_code, detail=str(exc.detail))
    )


async def validation_exception_handler(request: Request, exc: RequestValidationError) -> JSONResponse:
    """
    处理请求参数校验异常

    将 Pydantic 校验错误转换为统一格式
    """
    # 提取校验错误详情
    errors = []
    for error in exc.errors():
        field = ".".join(str(loc) for loc in error.get("loc", []))
        errors.append({
            "field": field,
            "message": error.get("msg", ""),
            "type": error.get("type", "")
        })

    # 记录错误日志
    logger.warning(
        f"ValidationError: {len(errors)} validation errors | "
        f"Path: {request.url.path} | "
        f"Method: {request.method} | "
        f"Errors: {errors}"
    )

    return JSONResponse(
        status_code=status.HTTP_400_BAD_REQUEST,
        content=APIResponse.error(
            ErrorCode.VALIDATION_ERROR,
            detail="请求参数校验失败",
            extra_data={"errors": errors}
        )
    )


async def general_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    """
    处理所有未捕获的异常

    作为最后的兜底处理器，防止异常信息泄露到客户端
    """
    # 记录详细错误日志（包含堆栈）
    error_trace = traceback.format_exc()
    logger.error(
        f"Unhandled Exception: {str(exc)} | "
        f"Path: {request.url.path} | "
        f"Method: {request.method}\n"
        f"Traceback:\n{error_trace}"
    )

    # 返回通用错误信息，不暴露内部细节
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content=APIResponse.error(
            ErrorCode.SYSTEM_ERROR,
            detail="服务器内部错误，请稍后重试"
        )
    )


def register_exception_handlers(app):
    """
    注册所有异常处理器到 FastAPI 应用

n    使用示例:
        from fastapi import FastAPI
        from app.core.exception_handlers import register_exception_handlers

        app = FastAPI()
        register_exception_handlers(app)
    """
    # 业务异常（最高优先级）
    app.add_exception_handler(BusinessException, business_exception_handler)

    # 参数校验异常
    app.add_exception_handler(RequestValidationError, validation_exception_handler)

    # HTTP 异常
    app.add_exception_handler(StarletteHTTPException, http_exception_handler)

    # 通用异常兜底（最低优先级）
    app.add_exception_handler(Exception, general_exception_handler)

    logger.info("异常处理器注册完成")
