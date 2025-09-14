from dataclasses import dataclass

import os

@dataclass(frozen=True)
class SocketConfig:
    SOCKET_PATH = str(os.environ.get("SOCKET_PATH", "/run/cherry-socket.sock"))
    SOCKET_MODE = int(os.environ.get("SOCKET_MODE", "0660"), 8) # Unix octal system privilige conversion to int
    SOCKET_USER = str(os.environ.get("SOCKET_USER", "CherryWorker"))
    SOCKET_GROUP = str(os.environ.get("SOCKET_GROUP", "CherryWorker"))
    REQUEST_TIMEOUT = 10.0

SOCKET_CONFIG = SocketConfig()