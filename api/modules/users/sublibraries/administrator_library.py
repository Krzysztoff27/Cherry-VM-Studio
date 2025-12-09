import logging

from ..models import Administrator, AdministratorExtended, AdministratorInDB, CreateAdministratorArgs
from modules.postgresql.simple_select import select_single_field
from modules.postgresql.simple_table_manager import SimpleTableManager


logger = logging.getLogger(__name__)


def prepare_from_database_record(record: AdministratorInDB) -> Administrator:
    administrator = Administrator.model_validate(record)
    
    administrator.roles = select_single_field("uuid",
        f"SELECT roles.uuid FROM roles"
        f"JOIN administrators_roles ON roles.uuid = administrators_roles.role_uuid"
        f"JOIN administrators ON administrators_roles.administrator_uuid = administrators.uuid"
        f"WHERE administrators.uuid = %s", (administrator.uuid,)
    )
        
    return administrator
    
class AdministratorTableManager(SimpleTableManager):
    
    def __init__(self):
        self.model_extended = AdministratorExtended
        super().__init__(
            table_name="administrators",
            allowed_fields_for_select={"uuid","username","email"},
            model=Administrator,
            model_in_db=AdministratorInDB,
            model_creation_args=CreateAdministratorArgs,
            prepare_record=prepare_from_database_record
        )
    
    def extend_model(self, administrator: Administrator) -> AdministratorExtended:
        from .roles_library import RoleLibrary
        
        return AdministratorExtended(
            **administrator.model_dump(exclude={"roles"}),
            roles=RoleLibrary.get_all_records_matching("uuid", administrator.roles)
        )

AdministratorLibrary = AdministratorTableManager()