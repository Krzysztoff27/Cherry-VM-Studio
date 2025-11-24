from dataclasses import dataclass
from utils.get_env import get_env

@dataclass(frozen=True)
class EnvConfig:
    SYSTEM_WORKER_UID: str = get_env("SYSTEM_WORKER_UID")
    SYSTEM_WORKER_GID: str = get_env("SYSTEM_WORKER_GID")
    NETWORK_RAS_NAME: str = get_env("NETWORK_RAS_NAME")
    GUACD_HOSTNAME: str = get_env("GUACD_HOSTNAME")

ENV_CONFIG = EnvConfig()