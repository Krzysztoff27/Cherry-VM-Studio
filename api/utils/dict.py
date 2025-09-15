from typing import Any

def push_to_dict (dict: dict, key: str, value: Any) -> None:
    if key not in dict:
        dict[key] = []
    dict[key].append(value)