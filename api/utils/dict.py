def push_to_dict (dict: dict, key: str, value: any) -> None:
    if key not in dict:
        dict[key] = []
    dict[key].append(value)