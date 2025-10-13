from uuid import UUID
from pydantic import BaseModel

class UploadTooLargeException(Exception):
    def __init__(self, body_len: int):
        self.body_len = body_len
        super().__init__(f"Upload too large: {body_len} bytes")


class UploadHeadersError(Exception):
    pass


class UploadInvalidExtensionException(Exception):
    def __init__(self, extension: str):
        self.extension = extension
        super().__init__(f"Invalid file extension: {extension}")

class UploadedFile(BaseModel):
    uuid: UUID
    name: str
    location: str
    size: int
    form_data: str