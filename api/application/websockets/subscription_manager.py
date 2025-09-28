import logging
from uuid import UUID
from starlette.websockets import WebSocket
from application.exceptions import RaisedException
from pydantic import BaseModel
from typing import Callable, Any
import asyncio

class SubscriptionManager(BaseModel):
    subscriptions: dict[UUID, list[WebSocket]] = {}
    broadcast_data: Callable[[dict[UUID, list[WebSocket]]], Any] | None = None
    broadcasting: bool = False

    class Config:
        arbitrary_types_allowed = True

    def subscribe(self, key, websocket):
        """ """
        if not key in self.subscriptions: 
            self.subscriptions[key] = [websocket]
        elif websocket not in self.subscriptions[key]:
            self.subscriptions[key].append(websocket)
        else: 
            raise RaisedException(f"Already subscribed to \"{key}\"")
        
        logging.info("Subscriptions: ", self.subscriptions)
        
    def set_subscribtions(self, keys, websocket):
        self.unsubscribe_from_all(websocket)
        
        for key in keys:
            self.subscribe(key, websocket)

    def unsubscribe(self, key, websocket):
        """ remove websocket subscription from the key """
        if not key in self.subscriptions or websocket not in self.subscriptions[key]:
            raise RaisedException(f"Already unsubscribed from \"{key}\".")
        self.remove_subscription(key, websocket)
        
        logging.info("Subscriptions: ", self.subscriptions)

    def unsubscribe_from_all(self, websocket):
        """ iterate through every key and remove websocket where present """
        for key in list(self.subscriptions): # snapshot for removing data while iterating
            if websocket in self.subscriptions[key]: 
                self.remove_subscription(key, websocket)
        logging.info("Subscriptions: ", self.subscriptions)

    def remove_key(self, key):
        del self.subscriptions[key]
        
    def remove_subscription(self, key, websocket):
        """ if its the last subscription for the resource, delete the resource uuid from subscriptions """
        if len(self.subscriptions[key]) == 1: self.remove_key(key)
        else: self.subscriptions[key].remove(websocket)
        
    async def run_continuous_broadcast(self, intervalInSeconds):
        """ start running the broadcast data function for the subscriptions every interval """
        if self.broadcasting: return # if already broadcasting no need to double it
        self.broadcasting = True
        while self.broadcasting and self.broadcast_data:
            logging.info("broadcasting")
            await self.broadcast_data(self.subscriptions)
            await asyncio.sleep(intervalInSeconds)
            
    def stop_continous_broadcast(self):
        self.broadcasting = False