
import logging
from modules.machine_lifecycle.models import MachineParameters
from modules.postgresql.simple_table_manager import SimpleTableManager


logger = logging.getLogger(__name__)

                
def prepare_from_database_record(template: MachineParameters) -> MachineParameters:
    return template


TemplateLibrary = SimpleTableManager(
    table_name="machine_templates",
    allowed_fields_for_select={"uuid", "name"},
    model=MachineParameters,
    model_in_db=MachineParameters,
    model_creation_args=MachineParameters,
    transform_record=prepare_from_database_record
)