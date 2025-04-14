from dataclasses import dataclass
from pathlib import Path

@dataclass(frozen=True)
class FilesConfig:
    network_config_intnets: Path = Path("data/network_configuration/intnets.local.json")
    network_config_state_save: Path = Path("data/network_configuration/current_state.local.json")
    network_config_snapshots: Path = Path("data/network_configuration/snapshots.local.json")
    network_config_presets: Path = Path("data/network_configuration/presets.json")

FILES_CONFIG = FilesConfig()