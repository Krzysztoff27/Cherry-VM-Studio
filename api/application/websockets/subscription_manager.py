from uuid import UUID
from pydantic import BaseModel
from typing import Callable, Any
from starlette.websockets import WebSocket
from application.exceptions import RaisedException
from .models import Subscription, SubscriptionsDict
import asyncio

class SubscriptionManager(BaseModel):
    subscriptions: SubscriptionsDict = {}
    broadcast_data: Callable[[SubscriptionsDict], Any] | None = None
    broadcasting: bool = False

    class Config:
        arbitrary_types_allowed = True


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

        
    async def run_continuous_broadcast(self, intervalInSeconds):
        """ start running the broadcast data function for the subscriptions every interval """
        if self.broadcasting: return # if already broadcasting no need to double it
        self.broadcasting = True
        while self.broadcasting and self.broadcast_data is not None:
            await self.broadcast_data(self.subscriptions)
            await asyncio.sleep(intervalInSeconds)
            
            
    def stop_continous_broadcast(self):
        self.broadcasting = False