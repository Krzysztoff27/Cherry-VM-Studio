def pushToDict (dict: dict, key: str, value: any) -> None:
    if key not in dict:
        dict[key] = []
    dict[key].append(value)