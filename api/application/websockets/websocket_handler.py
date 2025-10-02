from starlette.websockets import WebSocket, WebSocketState
from pydantic import BaseModel
from fastapi.encoders import jsonable_encoder
from application.exceptions import RaisedException
from .models import CommandData, AcknowledgeResponse, RejectResponse


# https://github.com/Krzysztoff27/Cherry-VM-Studio/wiki/Cherry-API#WebSocketHandler
class WebSocketHandler(BaseModel):
    websocket: WebSocket
    
    class Config:
        arbitrary_types_allowed = True

    async def accept(self) -> None:
        await self.websocket.accept()
        
    async def close(self, code: int = 1000, reason: str | None = None) -> None:
        await self.websocket.close(code, reason)

    def is_connected(self) -> bool:
        return self.websocket.application_state == WebSocketState.CONNECTED and self.websocket.client_state == WebSocketState.CONNECTED

    async def acknowledge(self, command: dict = {}) -> None:
        acknowledge = AcknowledgeResponse(command = CommandData(**command))
        await self.websocket.send_json(jsonable_encoder(acknowledge.model_dump()))

    async def reject(self, command: dict = {}, reason: Exception | RaisedException | str | None = None) -> None:     
        reject = RejectResponse(command = CommandData(**command), reason = str(reason))
        await self.websocket.send_json(jsonable_encoder(reject.model_dump()))