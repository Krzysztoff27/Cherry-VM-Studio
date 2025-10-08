from uuid import UUID
from pydantic import BaseModel

class UploadTooLargeException(Exception, BaseModel):
    body_len: int
    
class UploadMissingFilenameException(Exception):
    pass

class UploadInvalidExtensionException(Exception, BaseModel):
    extension: str
    pass

class UploadedFile(BaseModel):
    uuid: UUID
    name: str
    location: str
    size: int
    form_data: str