import logging
from starlette.websockets import WebSocketDisconnect
from json import JSONDecodeError
from pydantic import ValidationError

from .models import MachineWebsocketSubscribeCommand
from modules.machine_state.data_retrieval import check_machine_membership
from modules.exceptions.models import CredentialsException
from modules.websockets.subscription_manager import SubscriptionManager
from modules.websockets.websocket_handler import WebSocketHandler
from modules.authentication.validation import validate_user_token

logger = logging.getLogger(__name__)

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
                    await self.reject({}, f"Error occured during message decoding. Detail: {e}")
        except WebSocketDisconnect:
            # when websocket disconnects, unsubscribe it for all
            return self.subscription_manager.unsubscribe_from_all(self.websocket)
        except Exception as e:
            logging.exception(f"Unhandled expection within websocket {self.websocket}.")


    """ handle received command """
    async def handle_command(self, json: dict) -> None:
        try:
            command = MachineWebsocketSubscribeCommand.model_validate(json)
            validate_user_token(command.access_token, 'access')
            
            for machine_uuid in command.target:
                if not check_machine_membership(machine_uuid):
                    command.target.remove(machine_uuid)
                    logger.warning("Machine Websocket: Tried to subscribe to a machine not managed by Cherry VM Studio.")
            
            self.subscription_manager.set_subscriptions(self.websocket, command.target)
            
            await self.acknowledge(command.model_dump())
            
        except ValidationError:
            await self.reject(json, "Command validation error. Ensure that sent commands follow the expected structure.")
        except CredentialsException:
            await self.reject(json, "Authentication failed - invalid credentials.")
        except ValueError:
            await self.reject(json, "Command validation error - invalid UUID.")
        except Exception as e:
            await self.reject(json)
            logger.error(f"""
                Unhandled exception within websocket {self.websocket} in handle_command.\n
                Received json:\n
                {json}\n
                Exception:\n
                {e}\n
                """,
                exc_info=True
            )

    
        