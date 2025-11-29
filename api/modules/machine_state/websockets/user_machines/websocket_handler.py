import logging
from typing import override

from modules.websockets.subscription_manager import SubscriptionManager
from modules.websockets.websocket_handler import WebSocketHandler

logger = logging.getLogger(__name__)

class UserMachinesWebsocketHandler(WebSocketHandler):
    subscription_manager: SubscriptionManager
    
    @override
    async def accept(self):
        await super().accept()
        
        if self.is_connected() and self.user is not None:
            self.subscription_manager.subscribe(self.websocket, self.user.uuid)
    
    @override
    async def close(self, code: int = 1000, reason: str | None = None) -> None:
        self.subscription_manager.unsubscribe_from_all(self.websocket)
        
        await super().close(code, reason)
    


    
