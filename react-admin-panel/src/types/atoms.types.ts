import { ButtonProps, GridColProps, TitleProps } from "@mantine/core";
import { TablerIcon } from "@tabler/icons-react";
import { MouseEventHandler } from "react";
import { MachineData, MachineState, MachineStates } from "./machines.types";

export interface StateDividerProps {
    label: MachineStates;
}

export interface TextWithIconProps {
    Icon: TablerIcon;
    text: string;
}

export interface ConnectButtonProps {
    active: boolean;
    label: string;
    onClick: React.MouseEventHandler;
}

export interface MediumPanelButonProps extends ButtonProps {
    Icon: TablerIcon;
    label: string;
    onClick?: MouseEventHandler;
}

export interface NavButtonProps {
    label: string;              // aria-label
    active?: boolean;           // is currently selected? default = false
    icon: React.ReactElement;
    [x: string]: unknown
}

export interface MachineTitleProps extends TitleProps {
    machine: MachineData;
}

export interface MachineControlsProps { 
    currentState: MachineState;
    size?: string | number | null | undefined;
}