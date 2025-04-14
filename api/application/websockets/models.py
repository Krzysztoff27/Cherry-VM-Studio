from typing import Literal
from pydantic import BaseModel, Field
from uuid import UUID, uuid4
    
###############################
# Websocket messages
###############################

class Command(BaseModel, extra='allow'):
    method: Literal["START","STOP","UPDATE","SUBSCRIBE","UNSUBSCRIBE"]
    access_token: str = ""
    uuid: UUID = Field(default_factory=uuid4)
    
class CommandData(BaseModel):
    method: str = "undefined"
    uuid: UUID = Field(default_factory=uuid4)

class Response(BaseModel):
    method: Literal["ACKNOWLEDGE","REJECT","LOADING_FIN","LOADING_START","DATA"]
    uuid: UUID = Field(default_factory=uuid4)

class AcknowledgeResponse(Response):
    method: str = "ACKNOWLEDGE"
    command: CommandData

class RejectResponse(Response):
    method: str = "REJECT"
    reason: str
    command: CommandData

class LoadingStartResponse(Response):
    method: str = "LOADING_START"
    
class LoadingFinResponse(Response):
    method: str = "LOADING_FIN"

class DataResponse(Response):
    method: str = "DATA"
    body: dict | None = None
