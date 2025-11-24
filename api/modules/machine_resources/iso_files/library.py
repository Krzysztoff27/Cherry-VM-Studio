import logging

from .models import CreateIsoRecordArgs, IsoRecord, IsoRecordInDB
from modules.postgresql.simple_table_manager import SimpleTableManager
from modules.users.users import get_administrator_by_field

logger = logging.getLogger(__name__)


def prepare_from_database_record(record: IsoRecordInDB) -> IsoRecord:
    imported_by = get_administrator_by_field("uuid", str(record.imported_by)) if record.imported_by is not None else None
    last_modified_by = get_administrator_by_field("uuid", str(record.last_modified_by)) if record.last_modified_by is not None else None
    file_location = record.file_location if record.remote else None
    
    return IsoRecord(
        **record.model_dump(exclude={"imported_by","last_modified_by","file_location"}),
        imported_by=imported_by,
        last_modified_by=last_modified_by,
        file_location=file_location
    )


IsoLibrary = SimpleTableManager(
    table_name="iso_files",
    allowed_fields_for_select={"uuid", "name"},
    model=IsoRecord,
    model_in_db=IsoRecordInDB,
    model_creation_args=CreateIsoRecordArgs,
    transform_record=prepare_from_database_record,
)