import logging
from uuid import UUID

from api.modules.exceptions.models import RaisedException

from .models import CreateIsoRecordArgs, CreateIsoRecordForm, IsoRecord, IsoRecordInDB
from modules.postgresql import select_schema_dict, select_schema_one, pool
from modules.users.users import get_administrator_by_field, get_administrators


def get_iso_record_by_uuid(uuid: UUID) -> IsoRecord | None:
    database_record = select_schema_one(IsoRecordInDB, "SELECT * FROM iso_files WHERE iso_files.uuid = (%s)", (uuid, ))
    
    if database_record is None:
        return None
    
    imported_by = get_administrator_by_field("uuid", str(database_record.imported_by))
    last_modified_by = get_administrator_by_field("uuid", str(database_record.last_modified_by))
    
    return IsoRecord(
        **database_record.model_dump(exclude={"imported_by","last_modified_by"}),
        imported_by=imported_by,
        last_modified_by=last_modified_by,
    )
    
    
def get_iso_records() -> dict[UUID, IsoRecord]:
    records = select_schema_dict(IsoRecord, "uuid", "SELECT * FROM iso_files")
    administrators = get_administrators()
    
    for uuid, record in records.items():
        imported_by = administrators.get(record.imported_by) if record.imported_by is not None else None
        last_modified_by = administrators.get(record.last_modified_by) if record.last_modified_by is not None else None
        
        records[uuid] = IsoRecord(
            **record.model_dump(exclude={"imported_by","last_modified_by"}),
            imported_by=imported_by,
            last_modified_by=last_modified_by,
        )
        
    return records


def create_iso_record(form: CreateIsoRecordArgs) -> IsoRecord:
    with pool.connection() as connection:
        with connection.cursor() as cursor: 
            with connection.transaction():
                cursor.execute("""
                    INSERT INTO iso_files (uuid, name, file_name, file_location, file_size_bytes, imported_by, imported_at)            
                    VALUES (%(uuid)s, %(name)s, %(file_name)s, %(file_location)s, %(file_size_bytes)s, %(imported_by)s, %(imported_at))
                """, form.model_dump())
                
    iso_record = get_iso_record_by_uuid(form.uuid)
    
    if iso_record is None:
        raise RaisedException("Error occured while creating the ISO File Record in the iso_files database table.", form)
        
    return iso_record