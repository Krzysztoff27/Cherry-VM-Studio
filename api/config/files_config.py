from dataclasses import dataclass
from pathlib import Path

@dataclass(frozen=True)
class FilesConfig:
    network_config_presets: Path = Path("data/network_configuration/presets.json")
    upload_iso_directory = Path("data/iso/")
    upload_iso_max_size = 5 * 1024 * 1024 * 1024 # 5GB
    

FILES_CONFIG = FilesConfig()