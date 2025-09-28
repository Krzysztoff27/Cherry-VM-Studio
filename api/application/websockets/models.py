

from typing import Literal
from pydantic import BaseModel, Field
from uuid import UUID, uuid4


class Command(BaseModel, extra='allow'):
    method: str
    access_token: str = ""
    uuid: UUID = Field(default_factory=uuid4)

    
class CommandData(BaseModel):
    method: str
    uuid: UUID = Field(default_factory=uuid4)


class Response(BaseModel):
    method: Literal["ACKNOWLEDGE", "REJECT", "DATA"]
    uuid: UUID = Field(default_factory=uuid4)


class AcknowledgeResponse(Response):
    method: Literal["ACKNOWLEDGE"] = "ACKNOWLEDGE"
    command: CommandData


class RejectResponse(Response):
    method: Literal["REJECT"] = "REJECT"
    reason: str
    command: CommandData


class DataResponse(Response):
    method: Literal["DATA"] = "DATA"
    body: dict | None = None
