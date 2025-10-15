from fastapi.encoders import jsonable_encoder
from fastapi.websockets import WebSocketState
from modules.machine_state.data_retrieval import get_machine_states_by_uuids
from modules.websockets.models import DataResponse, SubscriptionsDict

async def broadcast_machine_state(subscriptions: SubscriptionsDict):   

    for subscription in subscriptions.values():
        if subscription.websocket.application_state != WebSocketState.CONNECTED or subscription.websocket.client_state != WebSocketState.CONNECTED: 
            continue
        
        body = get_machine_states_by_uuids(subscription.resources)
        await subscription.websocket.send_json(jsonable_encoder(DataResponse(body = body)))    