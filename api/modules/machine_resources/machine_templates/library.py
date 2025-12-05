import logging

from modules.users.users import get_administrator_by_field
from modules.machine_resources.machine_templates.models import CreateMachineTemplateArgs, MachineTemplate, MachineTemplateInDB
from modules.postgresql.simple_table_manager import SimpleTableManager

logger = logging.getLogger(__name__)


def prepare_from_database_record(record: MachineTemplateInDB) -> MachineTemplate:
    owner = get_administrator_by_field("uuid", str(record.owner_uuid))
    return MachineTemplate(**record.model_dump(), owner=owner)


MachineTemplatesLibrary = SimpleTableManager(
    table_name="machine_templates",
    allowed_fields_for_select={"uuid", "name", "owner_uuid"},
    model=MachineTemplate,
    model_in_db=MachineTemplateInDB,
    model_creation_args=CreateMachineTemplateArgs,
    transform_record=prepare_from_database_record
)

