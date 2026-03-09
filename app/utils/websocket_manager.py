from fastapi import WebSocket
from typing import Dict, List
import json


class ConnectionManager:
    """WebSocket连接管理器"""
    
    def __init__(self):
        # 存储所有活跃的WebSocket连接，按用户ID索引
        self.active_connections: Dict[int, WebSocket] = {}
    
    async def connect(self, websocket: WebSocket, user_id: int):
        """建立WebSocket连接"""
        await websocket.accept()
        self.active_connections[user_id] = websocket
    
    def disconnect(self, user_id: int):
        """断开WebSocket连接"""
        if user_id in self.active_connections:
            del self.active_connections[user_id]
    
    async def send_personal_message(self, message: dict, user_id: int):
        """向指定用户发送消息"""
        if user_id in self.active_connections:
            try:
                await self.active_connections[user_id].send_json(message)
            except Exception as e:
                print(f"发送消息失败: {e}")
                self.disconnect(user_id)
    
    async def broadcast(self, message: dict):
        """广播消息给所有连接的用户"""
        for user_id, connection in list(self.active_connections.items()):
            try:
                await connection.send_json(message)
            except Exception as e:
                print(f"广播消息失败: {e}")
                self.disconnect(user_id)


# 创建全局连接管理器实例
manager = ConnectionManager()
