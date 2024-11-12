import asyncio
from starlette.websockets import WebSocket, WebSocketDisconnect, WebSocketState
from main import app
from models.machine_data import MachineState
from models.websocket_messages import Command, DataResponse
from models.exceptions import RaisedException
from handlers.websocket.websocket_handler import WebSocketHandler
from pydantic import ValidationError
from handlers.websocket.subscription_manager import SubscriptionManager
from fastapi import status, HTTPException
from auth import get_authorized_user
from json import JSONDecodeError
from utils.dict import pushToDict

def get_machine_data(uuid: str):    
    return MachineState(
        active=True, 
        loading=False, 
        uuid=uuid, 
        active_connections=[],
        group='desktop', group_member_id=1,
        cpu=75, ram_max=4096, ram_used=1024
    ).model_dump()

""" Function for periodical broadcast of states of the machines """
""" subscriptions - dictionary mapping websockets subscribed to machine by its uuid (key - uuid, value - list of websockets)"""
async def broadcast_current_data(subscriptions: dict[str, list[WebSocket | WebSocketHandler]]) -> None:
    machines_data = {}
    subscriptions_by_websocket = {} # key - websocket, value - list of uuids of subscribed machines

    for uuid, subscribed in list(subscriptions.items()):
        # if machine has no subscribed websockets, move on to the next one
        if not subscribed: continue 

        # get current data of the machine and save it for later use
        machines_data[uuid] = get_machine_data(uuid) 
           
        # push uuid to the subscriptions_by_websocket for each subscribed websocket 
        for websocket in subscribed:
            if websocket.application_state == WebSocketState.CONNECTED: 
                pushToDict(subscriptions_by_websocket, websocket, uuid)
    
    # prepare and send data for each websocket
    for websocket, machine_uuids in list(subscriptions_by_websocket.items()):
        body = {}
        for uuid in machine_uuids: body[uuid] = get_machine_data(uuid)
        
        await websocket.send_json(DataResponse(body = body).model_dump())        
    

manager = SubscriptionManager(broadcast_data=broadcast_current_data)
asyncio.create_task(manager.run_continuous_broadcast(1))

class MachinesWebsocketHandler(WebSocketHandler):

    """ listen for incoming commands """
    async def listen(self):
        try:
            while self.is_connected():
                try:
                    # recieve command and handle it
                    command = await self.websocket.receive_json()
                    await self.handle_command(command)
                except JSONDecodeError as e:
                    # if invalid type of message (text or byte) return rejection
                    await self.reject(None, f"Error occured during message decoding. Detail: {e}")
        except WebSocketDisconnect:
            # when websocket disconnects, unsubscribe it for all
            return manager.unsubscribeFromAll(self.websocket)
        except Exception as e:
            print(f"Unhandled error with websocket {self.websocket}:\n {e}")

    """ validate recieved command structure """
    async def validate_command(self, json: dict) -> Command:
        try:
            command = Command.model_validate(json) # validate the structure
            await get_authorized_user(command.auth_token) # validate the authorization token
            return command 
        except ValidationError:
            # Validation error occurs when command structure is invalid
            raise RaisedException("Command validation error. Ensure that sent messages follow the expected structure:\nhttps://krzysztof27.notion.site/Cherry-API-7923eecc00564cb38c4d01d6696d201f")
        except HTTPException as e:
            # HTTPException is raised by get_authorized_user when token is invalid or user has missing permissions
            if(e.status_code == status.HTTP_403_FORBIDDEN): 
                raise RaisedException("Authenticated user does not belong to the access group.")
            raise RaisedException("Authentication failed.")

    """ handle recieved command """
    async def handle_command(self, json: dict) -> None:
        try:
            command = await self.validate_command(json)
            
            # perform action based on the command method
            match command.method:
                case "SUBSCRIBE": manager.subscribe(command.target, self.websocket)
                case "UNSUBSCRIBE": manager.unsubscribe(command.target, self.websocket)
                case "START": pass
                case "STOP": pass
                case "UPDATE": pass

            # if no errors occured, send acknowledgements
            await self.acknowledge(json)
        except RaisedException as reason:
            await self.reject(json, reason)
        except Exception as e:
            await self.reject(json)
            raise e;

@app.websocket("/ws/vm")
async def machine_state_socket(websocket: WebSocket):
    websocketHandler = MachinesWebsocketHandler(websocket = websocket)
    
    await websocketHandler.accept()
    await websocketHandler.listen()

    
        