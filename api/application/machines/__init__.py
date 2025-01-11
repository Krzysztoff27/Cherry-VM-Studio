from .machine import VirtualMachine

def get_machines() -> dict[str, VirtualMachine]:
    return {
        'test': VirtualMachine(uuid='test', group='desktop', group_member_id=1)
        # ...
    }
    
def get_machine(uuid: str) -> VirtualMachine:
    return VirtualMachine(uuid=uuid, group='desktop', group_member_id=1)