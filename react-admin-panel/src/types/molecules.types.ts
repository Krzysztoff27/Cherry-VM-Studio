import { SparklineProps } from "@mantine/charts";
import { MachineData } from "./machines.types";
import React from "react";
import { PopoverProps } from "@mantine/core";

export interface SparklineWithTextProps extends Omit<SparklineProps, 'data'> {
    label: string,
    chartData: Array<number>,
}

export interface MachineConnectionDetailsProps {
    active?: boolean,
    machine: MachineData,
}

export interface CollapsibleGroupToggleProps {
    toggleOpened: React.MouseEventHandler,
    opened: boolean,
    label: string
}

export interface PopoverRadioGroupProps extends Omit<PopoverProps, 'value' | 'onChange' | 'classNames'> {
    value: string,
    options: { value: string; label: string }[],
    // target: React.JSX.Element,
    classNames?: {
        popoverDropdown?: string,
        radioLabel?: string,
    };
    onValueChange: (value: string) => void,
    opened?: boolean | null,
}

export interface MachineStateChartData {
    cpu: number;
    ram_used: number;
    ram_max: number;
    time?: number;
}