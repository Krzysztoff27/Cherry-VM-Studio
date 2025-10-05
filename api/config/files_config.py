from dataclasses import dataclass
from pathlib import Path

@dataclass(frozen=True)
class FilesConfig:
    network_config_presets: Path = Path("data/network_configuration/presets.json")

FILES_CONFIG = FilesConfig()