from dataclasses import dataclass

@dataclass(frozen=True)
class RegexConfig:
    username: str = r"^[a-zA-Z][\w.-]{2,23}$"
    password: str = r"^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[$&+,:;=?@#|'<>.^*()%!_-]).{10,}$"
    network_snapshot_name: str = r"^[!-z]{3,24}$"

REGEX_CONFIG = RegexConfig()