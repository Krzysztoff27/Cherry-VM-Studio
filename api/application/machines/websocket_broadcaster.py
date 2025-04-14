from fastapi import WebSocket
from fastapi.encoders import jsonable_encoder
from fastapi.websockets import WebSocketState

from application.websockets.models import DataResponse
from utils.dict import push_to_dict

async def broadcast_machine_state(subscriptions: dict[str, list[WebSocket]]):
    subscriptions_by_websocket = {} # key - websocket, value - list of uuids of subscribed machines

    for uuid, subscribed in list(subscriptions.items()):
        # if machine has no subscribed websockets, move on to the next one
        if not subscribed: continue 
        
        # push uuid to the subscriptions_by_websocket for each subscribed websocket 
        for websocket in subscribed:
            if websocket.application_state == WebSocketState.CONNECTED: 
                push_to_dict(subscriptions_by_websocket, websocket, uuid)
    
    # # prepare and send data for each websocket
    for websocket, machine_uuids in list(subscriptions_by_websocket.items()):
        body = {} 
        # body = get_machine_states(machine_uuids)
        
        await websocket.send_json(jsonable_encoder(DataResponse(body = body)))    