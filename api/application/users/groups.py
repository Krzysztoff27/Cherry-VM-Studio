from application.users.models import Group
from utils.file import JSONHandler
from config.files_config import FILES_CONFIG

groups_database = JSONHandler(FILES_CONFIG.groups)

def get_all_groups() -> dict[str, Group]:
    groups = groups_database.read()
    if not groups:
        return {}
    return {key: Group(**group) for key, group in groups.items()}