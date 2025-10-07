from uuid import UUID, uuid4
from pydantic import BaseModel, Field

IntnetUuid = UUID 
MachineUuid = str # ! MUST BE STRING

class Coordinates(BaseModel):                   
    x: float = 0
    y: float = 0

#-------------------------------#
#  Network Panel Configuration  #
#-------------------------------#

class Intnet(BaseModel):                        # * Contains all necessary intnet information for the web panel
    uuid: IntnetUuid                            # unique intnet identifier 
    machines: list[MachineUuid] = []            # machines added to the intnet
    number: int | None = None                   # number indentifing the intnet from the user's perspective

IntnetConfiguration = dict[IntnetUuid, Intnet]  # * Form of the intnet data required by the frontend
    
Positions = dict[MachineUuid, Coordinates]

class NetworkConfiguration(BaseModel):         
    intnets: IntnetConfiguration | None = None   
    positions: Positions | None = None

#-------------------------------#
#           Snapshots           #
#-------------------------------#

class Snapshot(NetworkConfiguration):     
    name: str = "Unnamed" 
    uuid: UUID = Field(default_factory=uuid4)                     

#-------------------------------#
#            Presets            #
#-------------------------------#

class PresetCoreFunctions(BaseModel):           # * Functions required by the frontend for calculating network configuration from the preset
    getIntnet: str = ""                         # formula for calculating to which intnet should machine be added
    getPosX: str = ""                           # formula for calculating the machine's x position
    getPosY: str = ""                           # ------------------------------------- y position

class PresetCustomFunction(BaseModel):          # * Model of a custom function which can be used in core formulas
    expression: str = ""                        # Fparser valid formula
    arguments: list[str] = []                   # List of arguments used in the function e.g ["divident", "divisor"] or ['a', 'b', 'c'] ... etc.

class PresetData(BaseModel):                    # * All the algorithmic data, for calculating the preset, combined
    variables: dict[str, str] = {}              # constant or dynamic (by using Fparser formulas inside) variables to be used in core functions
    customFunctions: dict[str, PresetCustomFunction] = {} # all custom functions
    coreFunctions: PresetCoreFunctions = {}     # required core functions

class Preset(BaseModel):                        # * Full preset model
    uuid: UUID                                   # unique preset identifier
    name: str = "Unnamed"                       # name (ideally unique, there are NO checks for duplicates at any point)
    data: PresetData = {}                       # all the required algorithmic data