from typing import Annotated
from fastapi import Depends
from .models import *
from .tokens import *
from .validation import *

DependsOnAuthentication = Annotated[User, Depends(get_authenticated_user)]
DependsOnRefreshToken = Annotated[User, Depends(get_user_from_refresh_token)]