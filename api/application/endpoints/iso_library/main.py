import os
from uuid import UUID

from fastapi import HTTPException
from api.config.files_config import FILES_CONFIG
from modules.postgresql.models import RecordNotFoundException
from modules.machine_resources.iso_library import IsoLibrary
from modules.authentication.validation import DependsOnAdministrativeAuthentication
from modules.machine_resources.models import IsoRecord
from application.app import app

@app.get("/iso", response_model=dict[UUID, IsoRecord], tags=['ISO Library'])
async def __read_all_iso_file_records__(current_user: DependsOnAdministrativeAuthentication) -> dict[UUID, IsoRecord]:
    return IsoLibrary.get_all_records()


@app.get("/iso/{uuid}", response_model=IsoRecord, tags=['ISO Library'])
async def __read_iso_file_record__(uuid: UUID, current_user: DependsOnAdministrativeAuthentication) -> IsoRecord:
    record = IsoLibrary.get_record_by_uuid(uuid)
    if record is None: 
        raise HTTPException(status_code=404, detail=f"ISO file with UUID={uuid} does not exist.")
    return record


@app.delete("/iso/delete/{uuid}", response_model=None, tags=['ISO Library'])
async def __delete_iso_file_record__(uuid: UUID, current_user: DependsOnAdministrativeAuthentication):
    record = IsoLibrary.get_record_by_uuid(uuid)
    
    if record is None: 
        raise HTTPException(status_code=404, detail=f"ISO file with UUID={uuid} does not exist.")
    
    if not record.remote: 
        local_file_path = os.path.join(FILES_CONFIG.upload_iso_directory, f"{record.uuid}.iso")
        
        if os.path.exists(local_file_path): 
            os.remove(local_file_path)
        
    IsoLibrary.remove_record(uuid)