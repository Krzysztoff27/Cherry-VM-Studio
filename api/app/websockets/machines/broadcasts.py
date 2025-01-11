from app.machines import get_machines
from starlette.websockets import WebSocket, WebSocketState
from ..models import Subscriptions, DataResponse
from utils.dict import pushToDict

def get_machine_states():
    machines = get_machines()
    states = {}
    for machine in machines:
        states[machine.uuid] = machine.get_current_state()
    return states

""" Function for periodical broadcast of states of the machines """
""" subscriptions - dictionary mapping websockets subscribed to machine by its uuid (key - uuid, value - list of websockets)"""
async def broadcast_current_data(subscriptions: Subscriptions) -> None:
    machines = get_machines()
    subscriptions_by_websocket = {} # key - websocket, value - list of uuids of subscribed machines

    for uuid, subscribed in list(subscriptions.items()):
        # if machine has no subscribed websockets, move on to the next one
        if not subscribed: continue 
        
        # push uuid to the subscriptions_by_websocket for each subscribed websocket 
        for websocket in subscribed:
            if websocket.application_state == WebSocketState.CONNECTED: 
                pushToDict(subscriptions_by_websocket, websocket, uuid)
    
    # prepare and send data for each websocket
    for websocket, machine_uuids in list(subscriptions_by_websocket.items()):
        body = {}
        for uuid in machine_uuids: 
            body[uuid] = machines[uuid].get_current_state()
        
        await websocket.send_json(DataResponse(body = body).model_dump())    