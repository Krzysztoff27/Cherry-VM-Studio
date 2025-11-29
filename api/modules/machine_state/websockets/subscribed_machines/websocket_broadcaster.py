from fastapi import WebSocketDisconnect
from fastapi.encoders import jsonable_encoder
from fastapi.websockets import WebSocketState

from ...data_retrieval import get_machine_states_by_uuids
from modules.websockets.models import DataResponse, SubscriptionsDict


async def broadcast_subscribed_machines_state(subscriptions: SubscriptionsDict):  
    dead_subscriptions = [] 

    for key, subscription in subscriptions.items():
        ws = subscription.websocket

        if ws.application_state != WebSocketState.CONNECTED or ws.client_state != WebSocketState.CONNECTED: 
            dead_subscriptions.append(key)
            continue
        
        try: 
            body = get_machine_states_by_uuids(subscription.resources)
            await ws.send_json(jsonable_encoder(DataResponse(body = body)))    

        except (WebSocketDisconnect, RuntimeError):
            dead_subscriptions.append(key)
    
    for key in dead_subscriptions:
        subscriptions.pop(key, None)