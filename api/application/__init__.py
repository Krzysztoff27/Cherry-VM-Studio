#
# App __init__ file.
# Initializes FastAPI instance, downloads necessary config and sets global variables.
# Imports requests and websockets from .request module and .websockets module.
#

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from datetime import timedelta
from os import getenv

from pydantic import ValidationError
from config import AUTHENTICATION_CONFIG
import logging

###############################
#      FastAPI instance
###############################

app = FastAPI(root_path="/api")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # allow local origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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
    return JSONResponse(
        status_code=422,
        content={"detail": "Invalid type or form of the passed content."},
        headers={"Access-Control-Allow-Origin": "*"},
    )

###############################
#   Project constants
###############################

load_dotenv()

SECRET_KEY = getenv('SECRET_KEY') 
ALGORITHM = AUTHENTICATION_CONFIG.algorithm   
ACCESS_TOKEN_EXPIRE_DELTA = timedelta(minutes = AUTHENTICATION_CONFIG.access_token_expire_minutes)
REFRESH_TOKEN_EXPIRE_DELTA = timedelta(minutes = AUTHENTICATION_CONFIG.refresh_token_expire_minutes)

if not SECRET_KEY:
    raise Exception('SECRET_KEY not set in the env configuration.')

###############################
#   Submodules
###############################

import application.requests
import application.websockets

