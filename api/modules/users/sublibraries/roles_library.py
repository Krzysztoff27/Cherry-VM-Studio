import logging

from ..models import Role, RoleExtended, RoleInDB
from modules.postgresql.simple_table_manager import SimpleTableManager
from modules.postgresql.simple_select import select_single_field


logger = logging.getLogger(__name__)


def prepare_from_database_record(record: RoleInDB) -> Role:
    role = Role.model_validate(record)
    
    role.users = select_single_field("uuid",
        f"SELECT administrators.uuid FROM administrators"
        f"JOIN administrators_roles ON administrators.uuid = administrators_roles.administrator_uuid"
        f"JOIN roles ON administrators_roles.role_uuid = roles.uuid"
        f"WHERE roles.uuid = %s", (role.uuid, )   
    )
    
    return role

class RoleTableManager(SimpleTableManager):
    
    def __init__(self):
        self.model_extended = RoleExtended
        super().__init__(
            table_name="roles",
            allowed_fields_for_select={"uuid", "name"},
            model=Role,
            model_in_db=RoleInDB,
            model_creation_args=None,
            prepare_record=prepare_from_database_record,
        )
    
    def extend_model(self, role: Role) -> RoleExtended:
        from .administrator_library import AdministratorLibrary
        
        return RoleExtended(
            **role.model_dump(exclude={"users"}),
            users=AdministratorLibrary.get_all_records_matching("uuid", role.users)
        )

RoleLibrary = RoleTableManager()