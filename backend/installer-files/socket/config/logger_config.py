import logging
from os import getenv
from dataclasses import dataclass

@dataclass(frozen=True)
class LoggerConfig:
    level: int = getattr(logging, getenv("LOGGING_LEVEL", "INFO").upper(), logging.INFO)
    
    @classmethod
    def setup(cls) -> None:
        logging.basicConfig(
            level=cls.level
        )

LOGGER_CONFIG = LoggerConfig()