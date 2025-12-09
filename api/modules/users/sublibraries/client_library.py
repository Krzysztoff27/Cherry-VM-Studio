import logging

from modules.postgresql.simple_table_manager import SimpleTableManager
from modules.postgresql.simple_select import select_single_field

from ..models import Client, ClientExtended, ClientInDB, CreateClientArgs


logger = logging.getLogger(__name__)


def prepare_from_database_record(record: ClientInDB) -> Client:
    client = Client.model_validate(record)
    
    client.groups = select_single_field("uuid",
        f"SELECT groups.uuid FROM groups"
        f"JOIN clients_groups ON groups.uuid = clients_groups.group_uuid"
        f"JOIN clients ON clients_groups.client_uuid = clients.uuid"
        f"WHERE clients.uuid = %s", (client.uuid,)
    )
    
    return client


class ClientTableManager(SimpleTableManager):
    
    def __init__(self):
        self.model_extended = ClientExtended
        super().__init__(
            table_name="clients",
            allowed_fields_for_select={"uuid","username","email"},
            model=Client,
            model_in_db=ClientInDB,
            model_creation_args=CreateClientArgs,
            prepare_record=prepare_from_database_record
        )
    

    def extend_model(self, client: Client) -> ClientExtended:
        from .group_library import GroupLibrary
        
        return ClientExtended(
            **client.model_dump(exclude={"groups"}),
            groups=GroupLibrary.get_all_records_matching("uuid", client.groups)
        )
        
        
ClientLibrary = ClientTableManager()