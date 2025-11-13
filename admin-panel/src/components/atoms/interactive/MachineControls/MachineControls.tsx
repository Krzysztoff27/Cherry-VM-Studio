import { ActionIcon, Group } from "@mantine/core";
import { IconPlayerPlayFilled, IconPlayerStopFilled } from "@tabler/icons-react";
import React from "react";
import { MachineData, MachineState, SimpleState } from "../../../../types/api.types";
import useApi from "../../../../hooks/useApi";
import useFetch from "../../../../hooks/useFetch";
import { usePermissions } from "../../../../contexts/PermissionsContext";
import { isNull } from "lodash";

export interface MachineControlsProps {
    machine: MachineData | MachineState;
    state: SimpleState;
    size?: string | number | null | undefined;
}

const MachineControls = ({ machine, state, size = "lg" }: MachineControlsProps): React.JSX.Element => {
    const { sendRequest } = useApi();
    const { data: user, loading, error } = useFetch("user");
    const { canManageMachine } = usePermissions();

    const startMachine = () => {
        sendRequest("POST", `/machine/start/${machine.uuid}`);
    };

    const stopMachine = () => {
        sendRequest("POST", `/machine/stop/${machine.uuid}`);
    };

    const disable = !machine || loading || !isNull(error) || !canManageMachine(user, machine) || state?.fetching || state?.loading;

    return (
        <Group
            gap="sm"
            wrap="nowrap"
        >
            <ActionIcon
                variant="light"
                size={size}
                color="suse-green.9"
                disabled={disable || state?.active}
                onClick={startMachine}
            >
                <IconPlayerPlayFilled size={"28"} />
            </ActionIcon>
            <ActionIcon
                variant="light"
                size={size}
                color="red.9"
                disabled={disable || !state?.active}
                onClick={stopMachine}
            >
                <IconPlayerStopFilled size={"28"} />
            </ActionIcon>
        </Group>
    );
};

export default MachineControls;
