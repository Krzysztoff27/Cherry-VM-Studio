import logging

from modules.postgresql.simple_select import select_rows, select_schema
from modules.users.administrators.models import Administrator, AdministratorInDB, CreateAdministratorForm, RoleInDB
from modules.postgresql.simple_table_manager import SimpleTableManager

logger = logging.getLogger(__name__)

def prepare_from_database_record(record: AdministratorInDB) -> Administrator:
    administrator = Administrator.model_validate(record)
    
    administrator.roles = select_schema(RoleInDB, 
        f"SELECT roles.* FROM roles "
        f"JOIN administrators_roles ON roles.uuid = administrators_roles.role_uuid "
        f"JOIN administrators ON administrators_roles.administrator_uuid = administrators.uuid "
        f"WHERE administrators.uuid = (%s)", (administrator.uuid,)                                                      
    )
    
    for role in administrator.roles:
        administrator.permissions |= role.permissions
        
    return administrator
    

    
class AdministratorTableManager(SimpleTableManager):
    
    
    
    pass




AdministratorLibrary = AdministratorTableManager(
    table_name="administrators",
    allowed_fields_for_select={"uuid", "name", "email"},
    model=Administrator,
    model_in_db=AdministratorInDB,
    model_creation_args=CreateAdministratorForm,
    prepare_record=prepare_from_database_record
)