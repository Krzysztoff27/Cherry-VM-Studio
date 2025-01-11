from application import app
from application.authentication import DependsOnAuthentication
from application.network_configuration.models import Preset
from application.network_configuration.presets import *

@app.get("/network/preset/all", tags=['network configuration presets'])
def __get_presets__(current_user: DependsOnAuthentication) -> list[Preset]:
    return get_presets()

@app.get("/network/preset/{uuid}", tags=['network configuration presets'])
def get_network_configuration_preset(uuid: str, current_user: DependsOnAuthentication) -> Preset:
    return get_preset(uuid)