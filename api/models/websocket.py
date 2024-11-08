from typing import Literal
from pydantic import BaseModel, Extra
import uuid
    
class Command(BaseModel, extra=Extra.allow):
    method: Literal["START","STOP","UPDATE","SUBSCRIBE","UNSUBSCRIBE"]
    auth_token: str = ""
    uuid: str = str(uuid.uuid4())
    
class CommandData(BaseModel):
    method: str = "undefined"
    uuid: str = "undefined"

class Response(BaseModel):
    method: Literal["ACKNOWLEDGE","REJECT","LOADING_FIN","LOADING_START","DATA"]
    uuid: str = str(uuid.uuid4())

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
    data: dict | None = None

