import logging
from starlette.websockets import WebSocketDisconnect
from fastapi import status, HTTPException
from json import JSONDecodeError
from pydantic import ValidationError
from uuid import UUID

from api.application.websockets import subscription_manager
from application.exceptions.models import CredentialsException, RaisedException
from .models import MachineWebsocketCommand
from .state_management import start_machine, stop_machine
from .data_retrieval import check_machine_existence
from application.websockets.subscription_manager import SubscriptionManager
from application.websockets.websocket_handler import WebSocketHandler
from application.websockets.models import Command
from application.authentication.validation import validate_user_token

class MachinesWebsocketHandler(WebSocketHandler):
    subscription_manager: SubscriptionManager
    
    async def listen(self):
        try:
            while self.is_connected():
                try:
                    # receive command and handle it
                    command = await self.websocket.receive_json()
                    await self.handle_command(command)
                except JSONDecodeError as e:
                    await self.reject(None, f"Error occured during message decoding. Detail: {e}")
        except WebSocketDisconnect:
            # when websocket disconnects, unsubscribe it for all
            return self.subscription_manager.unsubscribe_from_all(self.websocket)
        except Exception as e:
            logging.exception(f"Unhandled expection within websocket {self.websocket}.")


    """ handle received command """
    async def handle_command(self, json: dict) -> None:
        try:
            command = MachineWebsocketCommand.model_validate(json)
            validate_user_token(command.access_token, 'access')
            
            self.subscription_manager.unsubscribe_from_all(self.websocket)
            self.subscription_manager.subscribe(command.target, self.websocket)
            
            await self.acknowledge(json)
            
        except ValidationError:
            await self.reject(json, "Command validation error. Ensure that sent commands follow the expected structure.")
        except CredentialsException:
            await self.reject(json, "Authentication failed - invalid credentials.")
        except ValueError:
            await self.reject(json, "Command validation error - invalid UUID.")
        except Exception as e:
            await self.reject(json)
            logging.error(f"""
                Unhandled exception within websocket {self.websocket} in handle_command.\n
                Received json:\n
                {json}\n
                Exception:\n
                {e}\n
                """,
                exc_info=True
            )

    
        