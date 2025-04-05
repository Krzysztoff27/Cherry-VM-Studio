from typing import Annotated
from fastapi import Depends

from application.users.models import AnyUser
from .models import *
from .tokens import *
from .validation import *
from .passwords import *

DependsOnAuthentication = Annotated[AnyUser, Depends(get_authenticated_user)]
DependsOnRefreshToken = Annotated[AnyUser, Depends(get_user_from_refresh_token)]