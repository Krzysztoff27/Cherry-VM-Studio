import logging

from uuid import UUID
from typing import Any, Dict, Optional, Union, TypedDict

logger = logging.getLogger(__name__)

class ClientRequest(TypedDict):
    id: str
    action: str
    params: Optional[Dict[str, Any]]

class ServerSuccess(TypedDict):
    success: bool
    request_id: str
    result: Union[str, dict, None]
    
class ServerError(TypedDict):
    success: bool
    request_id: Optional[str]
    error: dict

server_response = Union[ServerSuccess, ServerError]



def client_request(request_id: UUID, action: str, params: Optional[Dict[str, Any]]) -> ClientRequest:
    payload: ClientRequest = {
        "id": str(request_id),
        "action": action,
        "params": params
    }
    return payload