import logging

from api.modules.postgresql.simple_table_manager import SimpleTableManager
from modules.postgresql.simple_select import select_single_field
from ..models import Group, GroupExtended, GroupInDB

logger = logging.getLogger(__name__)


def prepare_from_database_record(record: GroupInDB) -> Group:
    group = Group.model_validate(record)
    
    group.users = select_single_field("uuid",
        f"SELECT clients.uuid FROM clients"
        f"JOIN clients_roles ON clients.uuid = clients_groups.administrator_uuid"
        f"JOIN groups ON clients_groups.role_uuid = groups.uuid"
        f"WHERE groups.uuid = %s", (group.uuid, )   
    )
    
    return group


class GroupTableManager(SimpleTableManager):
    
    def __init__(self):
        self.model_extended = GroupExtended
        super().__init__(
            table_name="groups",
            allowed_fields_for_select={"uuid", "name"},
            model=Group,
            model_in_db=GroupInDB,
            model_creation_args=None,
            prepare_record=prepare_from_database_record,
        )
    
    def extend_model(self, group: Group) -> GroupExtended:
        from .client_library import ClientLibrary
        
        return GroupExtended(
            **group.model_dump(exclude={"users"}),
            users=ClientLibrary.get_all_records_matching("uuid", group.users)
        )
        

GroupLibrary = GroupTableManager()