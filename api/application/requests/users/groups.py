from application.users.models import Group
from application import app
from application.users.groups import get_all_groups
from application.authentication import DependsOnAuthentication

# returns created user with uuid
@app.get("/groups", response_model=dict[str, Group], tags=['users'])
async def __read_groups__(current_user: DependsOnAuthentication) -> dict[str, Group]:
    return get_all_groups()