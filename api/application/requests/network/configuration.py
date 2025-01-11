from application import app
from fastapi import Depends
from application.authentication import DependsOnAuthentication
from application.network_configuration.models import NetworkConfiguration, IntnetConfiguration, FlowState
from application.network_configuration.configuration import get_current_flow_state, get_current_intnet_state, set_flow_state

@app.get("/network/configuration", tags=['network configuration'])
def __get_current_network_configuration__(current_user: DependsOnAuthentication) -> NetworkConfiguration:
    return NetworkConfiguration(
        intnets = get_current_intnet_state(),
        **get_current_flow_state(),
    )

@app.put("/network/configuration/intnets", tags=['network configuration'])
def __apply_intnet_configuration_to_vms__(intnet_configuration: IntnetConfiguration, current_user: DependsOnAuthentication) -> None:
    return
    
@app.put("/network/configuration/panelstate", tags=['network configuration'])
def __save_flow_state__(flow_state: FlowState, current_user: DependsOnAuthentication) -> None:
    set_flow_state(flow_state)
