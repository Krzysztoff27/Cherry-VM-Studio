import json
import logging
from fastapi.encoders import jsonable_encoder
from fastapi.websockets import WebSocketState
from modules.machine_state.data_retrieval import get_machine_states_by_uuids
from modules.websockets.models import DataResponse, SubscriptionsDict

logger = logging.getLogger(__name__)

async def broadcast_machine_state(subscriptions: SubscriptionsDict):   

    for subscription in subscriptions.values():
        if subscription.websocket.application_state != WebSocketState.CONNECTED or subscription.websocket.client_state != WebSocketState.CONNECTED: 
            continue
        
        logging.info("Subscribed machines: ", subscription.resources)
        body = get_machine_states_by_uuids(subscription.resources)
        logging.info(f"Fetched machine states: {body}")
        await subscription.websocket.send_json(jsonable_encoder(DataResponse(body = body)))    