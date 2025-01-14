import { Group } from "@mantine/core";
import React from "react";
import MachineTitle from "../../atoms/typography/MachineTitle/MachineTitle";
import { MachineHeadingProps } from "../../../types/components.types";
import { IconDeviceDesktop, IconDeviceDesktopOff } from "@tabler/icons-react";
import MachineControls from "../../atoms/interactive/MachineControls/MachineControls";
import StateBadge from "../../molecules/feedback/StateBadge/StateBadge";

const MachineHeading = ({currentState, machine} : MachineHeadingProps) : React.JSX.Element => (
    <Group justify="space-between" pl='lg' pr='lg'>
        <Group align="center">
            {
                currentState?.active ? 
                <IconDeviceDesktop size={'40'} /> : 
                <IconDeviceDesktopOff size={'40'} />
            }
            <MachineTitle order={1} machine={machine}/>
            <MachineControls currentState={currentState}/>
        </Group>
        <StateBadge 
            machineState={currentState} 
            sizes={{ badge: 'xl', loader: 'md', icon: 15 }} 
        />
    </Group>
);

export default MachineHeading;