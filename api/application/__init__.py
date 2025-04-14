#
# App __init__ file.
# Initializes FastAPI instance, downloads necessary config and sets global variables.
# Imports requests and websockets from .request module and .websockets module.
#

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from datetime import timedelta
from os import getenv

from config import AUTHENTICATION_CONFIG

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

import application.endpoints
import application.websockets
import application.exceptions.handlers

