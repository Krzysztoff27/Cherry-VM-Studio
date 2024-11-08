import asyncio
from starlette.websockets import WebSocket, WebSocketDisconnect, WebSocketState
from main import app
from models.websocket import Command, DataResponse
from models.exceptions import RaisedException
from handlers.websocket.websocket_handler import WebSocketHandler
from pydantic import ValidationError
from handlers.websocket.subscription_manager import SubscriptionManager
from fastapi import status, HTTPException
from auth import get_authorized_user
from json import JSONDecodeError

async def broadcast_current_data(subscriptions):
    for uuid, subscribed in list(subscriptions.items()):
        if not subscribed: continue

        for websocket in subscribed:
            if(websocket.application_state != WebSocketState.CONNECTED): continue
            """ SEND CURRENT DATA ABOUT THE MACHINE HERE """
            await websocket.send_json(DataResponse(data = {"cpu": 75}).model_dump())
            """ SEND CURRENT DATA ABOUT THE MACHINE HERE """

manager = SubscriptionManager(broadcast_data=broadcast_current_data)
asyncio.create_task(manager.run_continuous_broadcast(1))

class MachinesWebsocketHandler(WebSocketHandler):

    """ listen for incoming commands """
    async def listen(self):
        try:
            while self.is_connected():
                try:
                    command = await self.websocket.receive_json()
                    await self.handle_command(command)
                except JSONDecodeError as e:
                    await self.reject(None, f"Error occured during message decoding. Detail: {e}")
        except WebSocketDisconnect:
            return manager.unsubscribeFromAll(self.websocket)
        except Exception as e:
            print(f"Unhandled error with websocket {self.websocket}:\n {e}")

    """ validate recieved command structure """
    async def validate_command(self, json):
        try:
            command = Command.model_validate(json)
            await get_authorized_user(command.auth_token)
            return command
        except ValidationError:
            raise RaisedException("Command validation error. Ensure that sent messages follow the expected structure:\nhttps://krzysztof27.notion.site/Cherry-API-7923eecc00564cb38c4d01d6696d201f")
        except HTTPException as e:
            if(e.status_code == status.HTTP_403_FORBIDDEN): 
                raise RaisedException("Authenticated user does not belong to the access group.")
            raise RaisedException("Authentication failed.")

    """ handle recieved command """
    async def handle_command(self, json):
        try:
            command = await self.validate_command(json)
            
            match command.method:
                case "SUBSCRIBE": manager.subscribe(command.target, self.websocket)
                case "UNSUBSCRIBE": manager.unsubscribe(command.target, self.websocket)
                case "START": pass
                case "STOP": pass
                case "UPDATE": pass

            await self.acknowledge(json)
        except RaisedException as reason:
            await self.reject(json, reason)
        except Exception as e:
            await self.reject(json)
            raise e;

@app.websocket("/ws/vm")
async def machine_state_socket(websocket: WebSocket):
    websocketHandler = MachinesWebsocketHandler(websocket=websocket)
    
    # except HTTPException as e:
    #     await websocketHandler.close(code=status.WS_1008_POLICY_VIOLATION, reason="Authentication failed")
    #     return
    
    await websocketHandler.accept()
    await websocketHandler.listen()

    
        