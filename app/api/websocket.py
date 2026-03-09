from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends
from sqlalchemy.orm import Session
import json

from app.utils.mysql_client import get_db
from app.models.mysql_models import Notification, User
from app.utils.websocket_manager import manager
from app.api.auth import verify_token

router = APIRouter(tags=["WebSocket"])


def get_db_websocket():
    """WebSocket专用的数据库会话获取"""
    db = get_db()
    try:
        yield db
    finally:
        db.close()


@router.websocket("/ws/notifications")
async def websocket_notifications(websocket: WebSocket, db: Session = Depends(get_db_websocket)):
    """WebSocket实时通知接口"""
    user_id = None
    
    try:
        # 获取token进行认证
        token = websocket.query_params.get("token")
        if not token:
            await websocket.close(code=4001, reason="Missing token")
            return
        
        # 验证token并获取用户
        payload = verify_token(token)
        if not payload:
            await websocket.close(code=4001, reason="Invalid token")
            return
        
        user_id_str = payload.get("sub")
        if not user_id_str:
            await websocket.close(code=4001, reason="Invalid token payload")
            return
        
        # 注意：sub字段是用户名（字符串），不是用户ID（整数）
        username = user_id_str
        
        # 从数据库中获取用户ID
        user = db.query(User).filter(User.username == username).first()
        if not user:
            await websocket.close(code=4001, reason="User not found")
            return
        
        user_id = user.id
        
        # 建立连接
        await manager.connect(websocket, user_id)
        
        # 发送连接成功消息
        await websocket.send_json({
            "type": "connected",
            "message": "WebSocket连接已建立",
            "user_id": user_id
        })
        
        # 保持连接并处理消息
        while True:
            try:
                # 等待客户端消息
                data = await websocket.receive_text()
                message = json.loads(data)
                
                # 处理客户端请求
                if message.get("type") == "ping":
                    await websocket.send_json({"type": "pong"})
                elif message.get("type") == "get_unread":
                    # 获取未读通知数量
                    unread_count = db.query(Notification).filter(
                        Notification.user_id == user_id,
                        Notification.is_read == False
                    ).count()
                    await websocket.send_json({
                        "type": "unread_count",
                        "count": unread_count
                    })
                    
            except WebSocketDisconnect:
                break
            except Exception as e:
                print(f"处理WebSocket消息错误: {e}")
                break
                
    except WebSocketDisconnect:
        pass
    except Exception as e:
        print(f"WebSocket错误: {e}")
    finally:
        if user_id:
            manager.disconnect(user_id)
