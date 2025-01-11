from starlette.websockets import WebSocket, WebSocketDisconnect
from ..models import Command
from models.exceptions import RaisedException
from api.app.websockets.handlers.websocket_handler import WebSocketHandler
from pydantic import ValidationError
from fastapi import status, HTTPException
from app.authentication.users import get_current_user
from json import JSONDecodeError
from ..handlers.subscription_manager import SubscriptionManager

class MachinesWebsocketHandler(WebSocketHandler):
    """ listen for incoming commands """
    
    def __init__(self, websocket: WebSocket, subscription_manager: SubscriptionManager | None):
        self.subscription_manager = subscription_manager
        super(websocket)
    
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
            return self.subscription_manager.unsubscribeFromAll(self.websocket)
        except Exception as e:
            print(f"Unhandled error with websocket {self.websocket}:\n {e}")

    """ validate recieved command structure """
    async def validate_command(self, json: dict) -> Command:
        try:
            command = Command.model_validate(json) # validate the structure
            get_current_user(command.auth_token) # validate the authorization token
            return command 
        except ValidationError:
            # Validation error occurs when command structure is invalid
            raise RaisedException("Command validation error. Ensure that sent messages follow the expected structure:\nhttps://krzysztof27.notion.site/Cherry-API-7923eecc00564cb38c4d01d6696d201f")
        except HTTPException as e:
            # HTTPException is raised by get_current_user when token is invalid or user has missing permissions
            if(e.status_code == status.HTTP_403_FORBIDDEN): 
                raise RaisedException("Authenticated user does not belong to the access group.")
            raise RaisedException("Authentication failed.")

    """ handle recieved command """
    async def handle_command(self, json: dict) -> None:
        try:
            command = await self.validate_command(json)
            
            match command.method:
                case "SUBSCRIBE": self.subscription_manager.subscribe(command.target, self.websocket)
                case "UNSUBSCRIBE": self.subscription_manager.unsubscribe(command.target, self.websocket)
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

    
        