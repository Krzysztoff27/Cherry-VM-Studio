"""
Usage: import CherrySocketClient from this file and use as a context manager.
"""

from __future__ import annotations

import socket
import json
import uuid
import logging

from typing import Any, Dict, Optional
from config import SOCKET_CONFIG

logger = logging.getLogger(__name__)

def client_request(request_id: uuid.UUID, action: str, params: Optional[Dict[str, Any]]) -> dict:
    payload = {
        "id": str(request_id),
        "action": action,
        "params": params
    }
    return payload

class CherrySocketClient:
    """
    Client library for CherrySocket - custom UNIX named socket for Cherry VM Studio.
    Keep connection open for multiple calls. It will be closed on context exit.
    """
    
    def __init__(self, socket_path: str = SOCKET_CONFIG.SOCKET_PATH, timeout: float = SOCKET_CONFIG.REQUEST_TIMEOUT):
        self.socket_path = socket_path
        self.timeout = timeout
        self._sock: socket.socket | None = None
        self._file: socket.SocketIO | None = None
        self._lock = None
        
    def __enter__(self) -> CherrySocketClient:
        self._connect()
        return self
        
    def __exit__(self, exc_type, exc, tb) -> None:
        self.close()
    
    def _connect(self) -> None:
        try:
            self._sock = socket.socket(socket.AF_UNIX, socket.SOCK_STREAM)
            self._sock.settimeout(self.timeout)
            self._sock.connect(self.socket_path)
            # It's supposed to buffer r/w operations
            self._file = self._sock.makefile(mode="rwb", buffering=0)
        except Exception as e:
            raise Exception(f"Failed to connect to the socket: {e}")
        
    def close(self) -> None:
        try:
            if self._file:
                self._file.close()
        except Exception as e:
            logger.warning(f"CherrySocketClient failed to close file: {e}")
        try:
            if self._sock:
                self._sock.close()
        except Exception as e:
            logger.warning(f"CherrySocketClient failed to close socket: {e}")
            
        self._file = None
        self._sock = None
    
    def call(self, action: str, params: Optional[Dict[str, Any]] = None, request_id: Optional[uuid.UUID] = None) -> Dict[str, Any]:
        """
        Send one request and read (expect) one response line.
        Return parsed JSON response (dict).
        """
        
        if self._file is None or self._sock is None:
            self._connect()
        
        if params is None:
            params = {}
        
        if request_id is None:
            request_id = uuid.uuid4()
       
        data = (json.dumps(client_request(request_id, action, params), separators=(",", ":")) + "\n").encode("utf-8")
        
        assert self._file is not None

        # Try to write data to socket file
        try:
            self._file.write(data)
            self._file.flush()
        except BrokenPipeError as e:
            self.close()
            raise ConnectionError("Broken pipe writing to socket") from e
        
        # Read one response line from server
        line = self._file.readline()
        if not line:
            self.close()
            raise ConnectionError("Server closed connection unexpectedly")

        try:
            server_response = json.loads(line.decode("utf-8").strip())
        except Exception as e:
            raise ValueError(f"Invalid JSON from server: {e}")

        return server_response