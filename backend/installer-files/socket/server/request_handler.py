from __future__ import annotations

import json
import uuid
import logging
import socketserver

from typing import Optional, Union

from server.action_handler import ActionHandler

logger = logging.getLogger(__name__)

# Define messages body for convenience
def server_success(request_id: uuid.UUID, result: Union[str, dict, None]) -> dict:
    payload = {
        "success": True,
        "request_id": str(request_id),
        "result": result
    }
    return payload
    
def server_error(request_id: Optional[uuid.UUID] , error_type: str, message: str) -> dict:
    payload = {
        "success": False,
        "request_id": str(request_id),
        "error": {"type": error_type, "message": message}
    }
    return payload

class ThreadedUnixServer(socketserver.ThreadingMixIn, socketserver.UnixStreamServer):
    daemon_threads = True
    allow_reuse_address = True

class RequestHandler(socketserver.StreamRequestHandler):
    """
    This class provides a handler for client requests.\n
    Each line received from a client is treated as one JSON request.
    """
    
    def handle(self) -> None:
        # Check if peer has "fileno" attribute. If so, call it. If not - call lambda and set peer to None.
        peer = getattr(self.request, "fileno", lambda: None)()
        logger.debug(f"Open connection from fd={peer}")

        for raw_message in self.rfile:
            try:
                line = raw_message.decode("utf-8", errors="replace").strip()
                logger.debug(f"Received line: {line}")
            except Exception:
                logger.exception(f"Failed to read line from {self.rfile}")
                continue
                
            try:
                request = json.loads(line)
            except json.JSONDecodeError as e:
                # logger.exception("Failed to decode request")
                self._write(server_error(None, "400", f"Invalid JSON: {e}"))
                continue
            
            # Extract payload fields from the request
            request_id = request.get("id")
            request_action = request.get("action")
            request_params = request.get("params")
            
            if not isinstance(request_params, dict):
                self._write(server_error(request_id, "400", f"Field params must be an object and not {type(request_params)}"))
                continue
            
            # If the handler gets here it means that all of the fields were parsed succesfully and of the correct type
            try:
                result = ActionHandler.execute(request_action, request_params)
                self._write(server_success(request_id, result))
            except KeyError as e:
                self._write(server_error(request_id, "500", f"UnknownAction: {str(e)}"))
            except ValueError as e:
                self._write(server_error(request_id, "500", f"ValidationError: {str(e)}"))
            except Exception as e:
                logger.exception("Unhandled error while executing action")
                self._write(server_error(request_id, "500", f"InternalError: f{str(e)}"))
            
        
    def _write(self, payload: dict) -> None:
        try:
            line = (json.dumps(payload, separators=(",", ":")) + "\n").encode("utf-8")
            self.wfile.write(line)
            self.wfile.flush()
        except BrokenPipeError:
            logger.exception("Connection closed while writing")
