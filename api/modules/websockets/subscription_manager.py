from uuid import UUID
from pydantic import BaseModel, ConfigDict
from typing import Callable, Any
from starlette.websockets import WebSocket
from modules.exceptions import RaisedException
from .models import Subscription, SubscriptionsDict
import asyncio


# https://github.com/Krzysztoff27/Cherry-VM-Studio/wiki/Cherry-API#SubscriptionManager
class SubscriptionManager(BaseModel):
    subscriptions: SubscriptionsDict = {}
    broadcast_data: Callable[[SubscriptionsDict], Any] | None = None
    broadcasting: bool = False

    model_config = ConfigDict(arbitrary_types_allowed=True)

    def subscribe(self, websocket: WebSocket, resource_uuid: UUID):
        websocket_id = id(websocket)
        
        if websocket_id not in self.subscriptions:
            self.subscriptions[websocket_id] = Subscription(websocket=websocket, resources=set())
        self.subscriptions[websocket_id].resources.add(resource_uuid)
        
        
    def unsubscribe(self, websocket: WebSocket, resource_uuid: UUID):
        websocket_id = id(websocket)
        
        if websocket_id in self.subscriptions:
            self.subscriptions[websocket_id].resources.discard(resource_uuid)
        
            if not self.subscriptions[websocket_id].resources:
                del self.subscriptions[websocket_id]
        
        
    def set_subscriptions(self, websocket: WebSocket, resource_uuids: set[UUID]):
        websocket_id = id(websocket)
        self.subscriptions[websocket_id] = Subscription(websocket=websocket, resources=resource_uuids)
        

    def unsubscribe_from_all(self, websocket):
        websocket_id = id(websocket)
        
        if websocket_id in self.subscriptions:
            del self.subscriptions[websocket_id]
            
    def remove_subscription_from_all(self, resource_uuid: UUID):
        for subscription in self.subscriptions.values():
            subscription.resources.remove(resource_uuid)
        
    async def run_continuous_broadcast(self, intervalInSeconds):
        """ start running the broadcast data function for the subscriptions every interval """
        if self.broadcasting: return # if already broadcasting no need to double it
        self.broadcasting = True
        while self.broadcasting and self.broadcast_data is not None:
            await self.broadcast_data(self.subscriptions)
            await asyncio.sleep(intervalInSeconds)
            
            
    def stop_continous_broadcast(self):
        self.broadcasting = False