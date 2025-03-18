from dataclasses import dataclass
from pathlib import Path

@dataclass(frozen=True)
class FilesConfig:
    administrators: Path = Path("data/authentication/administrators.local.json")
    clients: Path = Path("data/authentication/clients.local.json")
    groups: Path = Path("data/authentication/groups.local.json")
    network_config_state_save: Path = Path("data/network_configuration/current_state.local.json")
    network_config_snapshots: Path = Path("data/network_configuration/snapshots.local.json")
    network_config_presets: Path = Path("data/network_configuration/presets.json")

FILES_CONFIG = FilesConfig()