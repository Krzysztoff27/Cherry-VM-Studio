import os
from pathlib import Path
from uuid import UUID, uuid4
from fastapi import Request
from pydantic import BaseModel
from urllib.parse import unquote
from streaming_form_data import StreamingFormDataParser
from streaming_form_data.targets import FileTarget, ValueTarget

from modules.file.models import UploadInvalidExtensionException, UploadMissingFilenameException, UploadTooLargeException


class UploadSizeValidator(BaseModel):
    body_len = 0
    max_size_bytes: int
    
    def add(self, chunk: bytes):
        self.body_len += len(chunk)
        if self.body_len > self.max_size_bytes:
            raise UploadTooLargeException(body_len=self.body_len)
        
        
class FilenameValidator(BaseModel):
    allowed_file_extensions: set[str]
    
    def validate(self, filename: str | None) -> str:
        if not filename:
            raise UploadMissingFilenameException()
        
        filename = unquote(filename)
        file_extension = os.path.splitext(filename)[1]
        
        if file_extension not in self.allowed_file_extensions:
            raise UploadInvalidExtensionException(extension=file_extension)
        
        return filename


class UploadHandler(BaseModel):
    max_size_bytes: int
    allowed_file_extensions: set[str]
    save_directory_path: Path
    
    async def handle(self, request: Request) -> tuple[UUID, str]:
        size_validator = UploadSizeValidator(max_size_bytes=self.max_size_bytes)
        filename_validator = FilenameValidator(allowed_file_extensions=self.allowed_file_extensions)
        
        filename = request.headers.get("filename")
        filename = filename_validator.validate(filename)
        
        file_uuid = uuid4()
        filepath = os.path.join(self.save_directory_path, f"{file_uuid}.iso")
        
        file_target = FileTarget(filepath, validator=UploadSizeValidator(max_size_bytes=self.max_size_bytes))
        data_target = ValueTarget()
        
        parser = StreamingFormDataParser(headers=request.headers)
        parser.register('file', file_target)
        parser.register('data', data_target)
        
        async for chunk in request.stream():
            size_validator.add(chunk)
            parser.data_received(chunk)
        
        data = data_target.value.decode()
        return (file_uuid, data)
            
        