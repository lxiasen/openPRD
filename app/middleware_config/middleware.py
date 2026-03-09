from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response
from fastapi import HTTPException
import time
import json
import uuid
from app.utils.logger import get_logger, get_request_logger

logger = get_logger(__name__)
request_logger = get_request_logger()


class RequestLoggingMiddleware(BaseHTTPMiddleware):

    async def dispatch(self, request: Request, call_next):
        request_id = str(uuid.uuid4())

        start_time = time.time()

        request_logger.info(
            f"请求: {request.method} {request.url.path} "
            f"[Request-ID: {request_id}] "
        )

        if request.method in ["POST", "PUT", "PATCH"]:
            try:
                body = await request.body()
                if body:
                    try:
                        body_json = json.loads(body)
                        request_logger.info(
                            f"[Request-ID: {request_id}] Request Body: {json.dumps(body_json, ensure_ascii=False)}"
                        )
                    except json.JSONDecodeError:
                        request_logger.info(
                            f"[Request-ID: {request_id}] Request Body: {body.decode('utf-8', errors='ignore')}"
                        )
            except Exception as e:
                request_logger.warning(f"[Request-ID: {request_id}] Failed to read request body: {str(e)}")

        try:
            response = await call_next(request)
        except HTTPException as exc:
            # 处理BusinessException的格式化错误信息
            error_detail = exc.detail
            if isinstance(error_detail, dict) and "code" in error_detail:
                error_message = f"{error_detail.get('code')}: {error_detail.get('message')}"
            else:
                error_message = str(error_detail)
            
            request_logger.warning(
                f"响应: {request.method} {request.url.path} "
                f"[Request-ID: {request_id}] "
                f"[Status: {exc.status_code}] "
                f"[Error: {error_message}]"
            )
            raise
        except Exception as exc:
            request_logger.error(
                f"响应: {request.method} {request.url.path} "
                f"[Request-ID: {request_id}] "
                f"[Status: 500] "
                f"[Error: {str(exc)}]"
            )
            raise

        process_time = time.time() - start_time

        request_logger.info(
            f"响应: {request.method} {request.url.path} "
            f"[Request-ID: {request_id}] "
            f"[Status: {response.status_code}] "
            f"[Duration: {process_time:.3f}s]"
        )

        return response