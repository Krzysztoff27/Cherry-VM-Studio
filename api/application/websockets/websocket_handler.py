from starlette.websockets import WebSocket, WebSocketState
from pydantic import BaseModel
from fastapi.encoders import jsonable_encoder
from application.exceptions import RaisedException
from .models import CommandData, AcknowledgeResponse, RejectResponse

class WebSocketHandler(BaseModel):
    websocket: WebSocket
    
    class Config:
        arbitrary_types_allowed = True

    async def accept(self):
        await self.websocket.accept()
        
    async def close(self, code, reason):
        await self.websocket.close(code, reason)

    def is_connected(self):
        return self.websocket.application_state == WebSocketState.CONNECTED and self.websocket.client_state == WebSocketState.CONNECTED

    async def acknowledge(self, command):
        if not command: command = {}
        acknowledge = AcknowledgeResponse(command = CommandData(**command))
        await self.websocket.send_json(jsonable_encoder(acknowledge.model_dump()))

    async def reject(self, command, reason: Exception | RaisedException | str | None = None):     
        if not command: command = {}   
        reject = RejectResponse(command = CommandData(**command), reason = str(reason))
        await self.websocket.send_json(jsonable_encoder(reject.model_dump()))