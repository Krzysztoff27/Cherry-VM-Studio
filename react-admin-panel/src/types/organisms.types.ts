import { MachineData, MachineState } from "./machines.types";

export interface MachineCardProps {
    machine: MachineData,
    currentState: MachineState,
    /** The navigation path where clicking the card should redirect the user. */
    to: string,
}

export interface MachineHeadingProps {
    machine: MachineData;
    currentState: MachineState;
}