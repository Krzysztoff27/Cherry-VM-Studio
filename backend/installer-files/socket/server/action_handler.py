
import logging

from typing import Any, Dict, Callable
from datetime import datetime

logger = logging.getLogger(__name__)

class ActionHandler:
    """
    Registry-based action handler.\n
    Allows to execute only registered and sanitised functions that accept a dict of params and return a serializable dict.
    """
    
    ACTIONS: Dict[str, Callable[[Dict[str, Any]], Dict[str, Any]]] = {}
    
    @classmethod
    def register(cls, name: str):
        def _decor(fn: Callable[[Dict[str, Any]], Dict[str, Any]]):
            cls.ACTIONS[name] = fn
            return fn
        return _decor
    
    @classmethod
    def execute(cls, action: str, params: Dict[str, Any]) -> Dict[str, Any]:
        if action not in cls.ACTIONS:
            raise KeyError(f"unknown action: {action}")
        return cls.ACTIONS[action](params)

@ActionHandler.register("test_conn")
def _test_conn(params: Dict[str, Any]) -> Dict[str, Any]: 
    return {"message": f"Server sucesfully received and processed the request at {datetime.now()}"}

