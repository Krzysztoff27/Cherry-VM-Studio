import { ActionIcon, Group } from "@mantine/core";
import { IconPlayerPlayFilled, IconPlayerStopFilled } from "@tabler/icons-react";
import React from "react";
import { MachineControlsProps } from "../../../../types/components.types";

const MachineControls = ({currentState, size = "lg"} : MachineControlsProps): React.JSX.Element => {
    return (
        <Group gap='sm'>
            <ActionIcon
                variant='light'
                size={size}
                color='red.9'
                disabled={currentState?.loading || !currentState?.active}
            >
                <IconPlayerStopFilled size={'28'} />
            </ActionIcon>
            <ActionIcon
                variant='light'
                size={size}
                color='suse-green.9'
                disabled={currentState?.loading || currentState?.active}
            >
                <IconPlayerPlayFilled size={'28'} />
            </ActionIcon>
        </Group>
    );
}

export default MachineControls;