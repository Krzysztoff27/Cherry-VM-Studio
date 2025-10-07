import logging
from fastapi import HTTPException, Request, status
from starlette.requests import ClientDisconnect
from streaming_form_data.validators import ValidationError


from config.files_config import FILES_CONFIG
from application.app import app
from modules.file.models import UploadInvalidExtensionException, UploadMissingFilenameException, UploadTooLargeException
from modules.authentication.validation import DependsOnAdministrativeAuthentication
from modules.file.upload_handler import UploadHandler

MAX_REQUEST_BODY_SIZE = FILES_CONFIG.upload_iso_max_size + 1024

upload_handler = UploadHandler(
    max_size_bytes=MAX_REQUEST_BODY_SIZE,
    save_directory_path=FILES_CONFIG.upload_iso_directory,
    allowed_file_extensions={"iso"}
)

@app.post("/iso/upload", response_model=None, tags=["ISO Library"])
async def __upload_iso_file__(current_user: DependsOnAdministrativeAuthentication, request: Request):
    
    try:
        file_uuid, data = await upload_handler.handle(request)
        
        # ...
        # ...
        # ...
        
    except ClientDisconnect:
        pass
    except UploadTooLargeException as e:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE, 
            detail=f'Maximum request body size limit ({MAX_REQUEST_BODY_SIZE} bytes) exceeded ({e.body_len} bytes read)'
        )
    except ValidationError:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE, 
            detail=f'Maximum request body size limit ({MAX_REQUEST_BODY_SIZE} bytes) exceeded.'
        )
    except UploadMissingFilenameException:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, 
            detail='Filename header is missing'
        )
    except UploadInvalidExtensionException as e:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, 
            detail=f'File extension {e.extension} is not allowed.'
        )
    except Exception:
        logging.exception("There was an error during file upload through the /iso/upload endpoint.\n")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
            detail='There was an error uploading the file'
        ) 
    
        
    
    