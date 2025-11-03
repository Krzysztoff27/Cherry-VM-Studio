from uuid import UUID


Params = tuple | list | dict


# https://github.com/Krzysztoff27/Cherry-VM-Studio/wiki/Cherry-API#InvalidFieldNameException
class InvalidFieldNameException(Exception):
    def __init__(self, field_name: str, **args):
        self.field_name = field_name
        super().__init__(args)


# https://github.com/Krzysztoff27/Cherry-VM-Studio/wiki/Cherry-API#RecordNotFoundException
class RecordNotFoundException(Exception):
    
    def __init__(self, uuid: UUID, **args):
        self.uuid = uuid
        super().__init__(args)