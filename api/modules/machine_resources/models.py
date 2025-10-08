import datetime as dt
from uuid import UUID, uuid4
from numpy import int64
from pydantic import BaseModel, Field

from modules.users.models import Administrator


class IsoRecordInDB(BaseModel):
    uuid: UUID
    name: str
    file_name: str
    file_location: str
    file_size_bytes: int
    last_used: dt.datetime | None
    imported_by: UUID | None
    imported_at: dt.datetime | None
    last_modified_by: UUID | None
    last_modified_at: dt.datetime | None
    
    
class IsoRecord(BaseModel):
    uuid: UUID
    name: str
    file_name: str
    file_size_bytes: int
    last_used: dt.datetime | None
    imported_at: dt.datetime | None
    last_modified_at: dt.datetime | None
    imported_by: Administrator | None
    last_modified_by: Administrator | None
    
    
class CreateIsoRecordForm(BaseModel):
    name: str
    file_name: str
    
    
class CreateIsoRecordArgs(CreateIsoRecordForm):
    uuid: UUID
    file_location: str
    file_size_bytes: int
    imported_by: UUID
    imported_at: dt.datetime
    