from pydantic import BaseModel

class UploadTooLargeException(Exception, BaseModel):
    body_len: int
    
class UploadMissingFilenameException(Exception):
    pass

class UploadInvalidExtensionException(Exception, BaseModel):
    extension: str
    pass