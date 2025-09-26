from dataclasses import dataclass

import os

@dataclass(frozen=True)
class SocketConfig:
    SOCKET_PATH = str(os.environ.get("SOCKET_PATH", "/run/cherry-vm-studio/cherry-socket.sock"))
    REQUEST_TIMEOUT = 10.0

SOCKET_CONFIG = SocketConfig()