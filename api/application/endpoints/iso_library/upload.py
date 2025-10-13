import datetime as dt
import logging
from fastapi import HTTPException, Request, status
from starlette.requests import ClientDisconnect
from streaming_form_data.validators import ValidationError as SFDValidationError
from pydantic import ValidationError as PydanticValidationError

from application.app import app
from config.files_config import FILES_CONFIG
from modules.file.models import UploadInvalidExtensionException, UploadMissingFilenameException, UploadTooLargeException
from modules.machine_resources.models import CreateIsoRecordArgs, CreateIsoRecordForm, IsoRecord
from modules.machine_resources.iso_library import create_iso_record
from modules.authentication.validation import DependsOnAdministrativeAuthentication
from modules.file.upload_handler import UploadHandler

logger = logging.getLogger(__name__)

MAX_REQUEST_BODY_SIZE = FILES_CONFIG.upload_iso_max_size + 1024

upload_handler = UploadHandler(
    max_size_bytes=MAX_REQUEST_BODY_SIZE,
    save_directory_path=FILES_CONFIG.upload_iso_directory,
    allowed_file_extensions={"iso"}
)

@app.post("/iso/upload", response_model=IsoRecord, tags=["ISO Library"])
async def __upload_iso_file__(current_user: DependsOnAdministrativeAuthentication, request: Request):
    
    try:
        uploaded_file = await upload_handler.handle(request)
        logging.debug(uploaded_file)
        form_data = CreateIsoRecordForm.model_validate_json(uploaded_file.form_data)
        logging.debug(form_data)
        
        creation_args = CreateIsoRecordArgs(
            **form_data.model_dump(), 
            uuid=uploaded_file.uuid,
            file_name=uploaded_file.name,
            file_location=uploaded_file.location,
            file_size_bytes=uploaded_file.size,
            imported_by=current_user.uuid,
            imported_at=dt.datetime.now(),
        )
        
        return create_iso_record(creation_args)
        
    except ClientDisconnect:
        pass
    except PydanticValidationError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail='Invalid JSON form structure'
        )
    except UploadMissingFilenameException:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, 
            detail='Filename header is missing'
        )
    except UploadTooLargeException as e:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE, 
            detail=f'Maximum request body size limit ({MAX_REQUEST_BODY_SIZE} bytes) exceeded ({e.body_len} bytes read)'
        )
    except SFDValidationError:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE, 
            detail=f'Maximum request body size limit ({MAX_REQUEST_BODY_SIZE} bytes) exceeded.'
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
    
        
    
    