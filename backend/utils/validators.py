def require_fields(data: dict, fields: list[str]) -> tuple[bool, list[str]]:
    missing = [f for f in fields if not data.get(f)]
    return (len(missing) == 0, missing)

