import logging
from typing import override

from modules.users.permissions import has_permissions
from config.permissions_config import PERMISSIONS
from modules.websockets.subscription_manager import SubscriptionManager
from modules.websockets.websocket_handler import WebSocketHandler

logger = logging.getLogger(__name__)

class AllMachinesWebsocketHandler(WebSocketHandler):
    subscription_manager: SubscriptionManager
    
    @override
    async def accept(self):
        await super().accept()
        
        if self.user is None or not has_permissions(self.user, PERMISSIONS.VIEW_ALL_VMS):
            return self.close(4403, "You do not have the necessary permissions to access this resource.")
        
        if self.is_connected() and self.user is not None:
            # gotta subscribe to sth so we're passing user.uuid as a subscription even though this WebSocket will send all machines
            self.subscription_manager.subscribe(self.websocket, self.user.uuid)
    
    @override
    async def close(self, code: int = 1000, reason: str | None = None) -> None:
        self.subscription_manager.unsubscribe_from_all(self.websocket)
        
        await super().close(code, reason)
    


    
