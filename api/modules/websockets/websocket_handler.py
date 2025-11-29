import asyncio
from datetime import datetime, timezone
import logging
from starlette.websockets import WebSocket, WebSocketState
from pydantic import BaseModel, ConfigDict
from fastapi.encoders import jsonable_encoder
from modules.users.models import AnyUser
from modules.exceptions.models import CredentialsException
from modules.authentication.validation import decode_token, get_authenticated_user
from modules.exceptions import RaisedException
from .models import CommandData, AcknowledgeResponse, RejectResponse

logger = logging.getLogger(__name__)

# https://github.com/Krzysztoff27/Cherry-VM-Studio/wiki/Cherry-API#WebSocketHandler
class WebSocketHandler(BaseModel):
    websocket: WebSocket
    closer: asyncio.Task | None = None
    user: AnyUser | None = None
    
    model_config = ConfigDict(arbitrary_types_allowed=True)

    async def accept(self) -> None:
        try: 
            access_token = self.websocket.headers.get("authorization")
        
            if access_token is None:
                raise CredentialsException
            
            self.user = get_authenticated_user(access_token)
            await self.websocket.accept()
            
            self.closer = asyncio.create_task(self.__close_at_token_expiration__(access_token))
            
        except CredentialsException:
            return await self.close(4401, "Could not validate credentials.")
        except Exception:
            await self.websocket.close(1011, "Internal server error.")
            logger.exception("Exception occured in the WebsocketHandler")
        
    async def __close_at_token_expiration__(self, access_token):
        try:
            decoded_payload = decode_token(access_token)
            expiration_delay = max(0, (decoded_payload.expiration_date - datetime.now(timezone.utc)).total_seconds())
            
            if expiration_delay > 0:
                await asyncio.sleep(expiration_delay)
            
            await self.websocket.close(4401, "Access token expired.")
        except Exception:
            await self.websocket.close(4401, "Invalid token.")
        
    async def close(self, code: int = 1000, reason: str | None = None) -> None:
        if self.closer is not None:
            self.closer.cancel()
        if self.is_connected():
            await self.websocket.close(code, reason)

    def is_connected(self) -> bool:
        return self.websocket.application_state == WebSocketState.CONNECTED and self.websocket.client_state == WebSocketState.CONNECTED

    async def acknowledge(self, command: dict = {}) -> None:
        acknowledge = AcknowledgeResponse(command = CommandData(**command))
        await self.websocket.send_json(jsonable_encoder(acknowledge.model_dump()))

    async def reject(self, command: dict = {}, reason: Exception | RaisedException | str | None = None) -> None:     
        reject = RejectResponse(command = CommandData(**command), reason = str(reason))
        await self.websocket.send_json(jsonable_encoder(reject.model_dump()))