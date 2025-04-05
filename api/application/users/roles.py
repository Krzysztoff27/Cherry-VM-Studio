from uuid import UUID
from application.postgresql import select_schema_dict
from application.users.models import Role


def get_all_roles() -> dict[UUID, Role]:
    return select_schema_dict(Role, "uuid", "SELECT * FROM roles")