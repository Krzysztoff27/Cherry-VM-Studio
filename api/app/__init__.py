from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from datetime import timedelta
from os import getenv
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
async def global_exception_handler(request: Request, exc: Exception):
    logging.error(f"Unhandled exception: {exc}")  # Log the error for debugging purposes

    # Return a JSON response with a 500 status code and **correct headers**.
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal Server Error"},
        headers={"Access-Control-Allow-Origin": "*"},
    )

###############################
#   Project constants
###############################

load_dotenv()

SECRET_KEY = getenv('SECRET_KEY') # openssl rand -hex 32
ALGORITHM = AUTHENTICATION_CONFIG.algorithm   # HS256
ACCESS_TOKEN_EXPIRE_DELTA = timedelta(minutes = AUTHENTICATION_CONFIG.access_token_expire_minutes)
REFRESH_TOKEN_EXPIRE_DELTA = timedelta(minutes = AUTHENTICATION_CONFIG.refresh_token_expire_minutes)

if not SECRET_KEY or not ALGORITHM:
    raise Exception('Both SECRET_KEY and ALGORITHM must be set in the .env configuration')

###############################
#   Submodules
###############################

import app.requests
import app.websockets