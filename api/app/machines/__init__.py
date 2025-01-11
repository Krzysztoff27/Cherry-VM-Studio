from .machine import VirtualMachine

def get_machines():
    return {
        1: VirtualMachine(uuid=1, group='desktop', group_member_id=1)
        # ...
    }