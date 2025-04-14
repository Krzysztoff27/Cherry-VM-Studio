from starlette.websockets import WebSocketDisconnect
from fastapi import status, HTTPException
from json import JSONDecodeError
from pydantic import ValidationError
from application.websockets.subscription_manager import SubscriptionManager
from application.websockets.websocket_handler import WebSocketHandler
from application.websockets.models import Command
from application.exceptions import RaisedException
from application.authentication.validation import get_authenticated_user

class MachinesWebsocketHandler(WebSocketHandler):
    subscription_manager: SubscriptionManager | None = None
    
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
            return self.subscription_manager.unsubscribe_from_all(self.websocket)
        except Exception as e:
            print(f"Unhandled error with websocket {self.websocket}:\n {e}")

    """ validate recieved command structure """
    async def validate_command(self, json: dict) -> Command:
        try:
            command = Command.model_validate(json) # validate the structure
            get_authenticated_user(command.access_token) # validate the authorization token
            return command 
        except ValidationError:
            # Validation error occurs when command structure is invalid
            raise RaisedException("""
                Command validation error. Ensure that sent messages follow the expected structure:\n
                https://krzysztof27.notion.site/Cherry-API-7923eecc00564cb38c4d01d6696d201f
            """)
        except HTTPException as e:
            # HTTPException is raised by get_authenticated_user when token is invalid or user has missing permissions
            if(e.status_code == status.HTTP_403_FORBIDDEN): 
                raise RaisedException("Authenticated user does not belong to the access group.")
            raise RaisedException("Authentication failed.")

    """ handle recieved command """
    async def handle_command(self, json: dict) -> None:
        try:
            command = await self.validate_command(json)
            
            if not hasattr(command, 'target') or not command.target: 
                raise RaisedException("No target attribute given. Target attribute should be an UUID representing the chosen machine for the operation.")
            
            
            match command.method:
                case "SUBSCRIBE": 
                    self.subscription_manager.subscribe(command.target, self.websocket)
                case "UNSUBSCRIBE": 
                    self.subscription_manager.unsubscribe(command.target, self.websocket)
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

    
        