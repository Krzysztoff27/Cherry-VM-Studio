import logging

from fastapi.responses import JSONResponse
from h11 import Request
from pydantic import ValidationError
from application import app

@app.exception_handler(Exception)
async def internal_exception_handler(request: Request, exc: Exception):
    logging.error(f"Unhandled exception: {exc}") 
    
    # Return a JSON response with a 500 status code and **correct headers**.
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal Server Error"},
        headers={"Access-Control-Allow-Origin": "*"},
    )
    
@app.exception_handler(ValidationError)
async def validation_exception_handler(request: Request, exc: ValidationError):
    errors = exc.errors()
    for error in errors:
        if error.get("type") == "uuid_parsing":
            return JSONResponse(
                status_code=400,
                content={"detail": "Invalid UUID format."},
                headers={"Access-Control-Allow-Origin": "*"},
            )
            
    logging.error(f"Unhandled exception: {exc}") 
            
    return JSONResponse(
        status_code=422,
        content={"detail": "Invalid type or form of the passed content."},
        headers={"Access-Control-Allow-Origin": "*"},
    )