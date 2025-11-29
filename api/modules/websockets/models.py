

from typing import Literal
from starlette.websockets import WebSocket
from pydantic import BaseModel, ConfigDict, Field
from uuid import UUID, uuid4


# https://github.com/Krzysztoff27/Cherry-VM-Studio/wiki/Cherry-API#Command
class Command(BaseModel, extra='allow'):
    method: str
    access_token: str = ""
    uuid: UUID = Field(default_factory=uuid4)
    

# https://github.com/Krzysztoff27/Cherry-VM-Studio/wiki/Cherry-API#CommandData
class CommandData(BaseModel):
    method: str | None = None
    uuid: UUID = Field(default_factory=uuid4) 


# https://github.com/Krzysztoff27/Cherry-VM-Studio/wiki/Cherry-API#ResponseMethods
ResponseMethods = Literal["ACKNOWLEDGE", "REJECT", "DATA"]


# https://github.com/Krzysztoff27/Cherry-VM-Studio/wiki/Cherry-API#Response
class Response(BaseModel):
    method: ResponseMethods
    uuid: UUID = Field(default_factory=uuid4)


# https://github.com/Krzysztoff27/Cherry-VM-Studio/wiki/Cherry-API#AcknowledgeResponse
class AcknowledgeResponse(Response):
    method: Literal["ACKNOWLEDGE"] = "ACKNOWLEDGE"
    command: CommandData


# https://github.com/Krzysztoff27/Cherry-VM-Studio/wiki/Cherry-API#RejectResponse
class RejectResponse(Response):
    method: Literal["REJECT"] = "REJECT"
    reason: str
    command: CommandData


# https://github.com/Krzysztoff27/Cherry-VM-Studio/wiki/Cherry-API#DataResponse
class DataResponse(Response):
    method: Literal["DATA"] = "DATA"
    body: dict | None = None


# https://github.com/Krzysztoff27/Cherry-VM-Studio/wiki/Cherry-API#Subscription
class Subscription(BaseModel):
    websocket: WebSocket
    resources: set[UUID]
    
    model_config = ConfigDict(arbitrary_types_allowed=True)



# https://github.com/Krzysztoff27/Cherry-VM-Studio/wiki/Cherry-API#SubscriptionsDict
SubscriptionsDict = dict[int, Subscription]