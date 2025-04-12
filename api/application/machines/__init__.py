from .machine import VirtualMachine

def get_machines() -> dict[str, VirtualMachine]:
    return {
        'e2d79ca5-8a02-47cd-bb04-8ac62c2aa548': VirtualMachine(uuid='e2d79ca5-8a02-47cd-bb04-8ac62c2aa548', group='desktop', group_member_id=1)
        # ...
    }
    
def get_machine(uuid: str) -> VirtualMachine:
    return VirtualMachine(uuid=uuid, group='desktop', group_member_id=1)