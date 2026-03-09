from fastapi import WebSocket
from typing import Dict, List
import json
from app.utils.logger import get_logger

logger = get_logger(__name__)


class ConnectionManager:
    """WebSocket连接管理器"""
    
    def __init__(self):
        # 存储所有活跃的WebSocket连接，按用户ID索引
        self.active_connections: Dict[int, WebSocket] = {}
    
    async def connect(self, websocket: WebSocket, user_id: int):
        """建立WebSocket连接"""
        try:
            await websocket.accept()
            self.active_connections[user_id] = websocket
            logger.info(f"WebSocket连接建立成功: user_id={user_id}")
        except Exception as e:
            logger.error(f"WebSocket连接建立失败: user_id={user_id}, error={str(e)}")
    
    def disconnect(self, user_id: int):
        """断开WebSocket连接"""
        if user_id in self.active_connections:
            del self.active_connections[user_id]
            logger.info(f"WebSocket连接已断开: user_id={user_id}")
    
    async def send_personal_message(self, message: dict, user_id: int):
        """向指定用户发送消息"""
        if user_id in self.active_connections:
            try:
                await self.active_connections[user_id].send_json(message)
                logger.debug(f"消息发送成功: user_id={user_id}, message_type={message.get('type')}")
            except Exception as e:
                logger.error(f"发送消息失败: user_id={user_id}, error={str(e)}")
                self.disconnect(user_id)
        else:
            logger.warning(f"用户未连接: user_id={user_id}")
    
    async def broadcast(self, message: dict):
        """广播消息给所有连接的用户"""
        connected_users = list(self.active_connections.keys())
        logger.debug(f"开始广播消息给 {len(connected_users)} 个用户")
        
        for user_id, connection in list(self.active_connections.items()):
            try:
                await connection.send_json(message)
                logger.debug(f"广播消息成功: user_id={user_id}")
            except Exception as e:
                logger.error(f"广播消息失败: user_id={user_id}, error={str(e)}")
                self.disconnect(user_id)


# 创建全局连接管理器实例
manager = ConnectionManager()
