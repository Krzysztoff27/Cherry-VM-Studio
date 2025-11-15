from dataclasses import dataclass
from utils.get_env import get_env

@dataclass(frozen=True)
class EnvConfig:
    SYSTEM_WORKER_UID: str = get_env("SYSTEM_WORKER_UID")
    SYSTEM_WORKER_GID: str = get_env("SYSTEM_WORKER_GID")

ENV_CONFIG = EnvConfig()