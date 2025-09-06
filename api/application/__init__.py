#
# App __init__ file.
# Initializes FastAPI instance, downloads necessary config and sets global variables.
# Imports requests and websockets from .request module and .websockets module.
#

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from datetime import timedelta
import os.path

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

# Retrieve secret key from secret file mount
jwt_secret_file = "/run/secrets/jwt_secret"

if os.path.isfile(jwt_secret_file):
    with open(jwt_secret_file, "r") as jwt_secret:
        SECRET_KEY = jwt_secret.read().rstrip()
        if not SECRET_KEY:
            raise Exception("jwt_secret was retrieved but is not set.")     
else:
    raise Exception("Could not access jwt_secret mount.")
 
ALGORITHM = AUTHENTICATION_CONFIG.algorithm   
ACCESS_TOKEN_EXPIRE_DELTA = timedelta(minutes = AUTHENTICATION_CONFIG.access_token_expire_minutes)
REFRESH_TOKEN_EXPIRE_DELTA = timedelta(minutes = AUTHENTICATION_CONFIG.refresh_token_expire_minutes)

###############################
#   Submodules
###############################

import application.endpoints
import application.websockets
import application.exceptions.handlers

