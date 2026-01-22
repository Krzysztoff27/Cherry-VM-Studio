import { Grid } from "@mantine/core";
import { useParams } from "react-router-dom";
import Column from "../../../../components/atoms/layout/Column/Column";
import LogsDisplay from "../../../../components/molecules/display/LogsDisplay/LogsDisplay";
import MachineStateChart from "../../../../components/molecules/display/MachineStateChart/MachineStateChart";
import MachineEditForm from "../../../../components/organisms/forms/MachineEditForm/MachineEditForm";
import MachineDataDisplay from "../../../../components/templates/MachineDataDisplay/MachineDataDisplay";
import { ERRORS } from "../../../../config/errors.config";
import useErrorHandler from "../../../../hooks/useErrorHandler";
import useMachineState from "../../../../hooks/useMachineState";
import { MachineData, MachineState } from "../../../../types/api.types.ts";
import useFetch from "../../../../hooks/useFetch.ts";

function MachinePage() {
    const { uuid } = useParams();
    const { data: machineData, loading, error, refresh } = useFetch<MachineData>(`/machines/${uuid}`);
    const { machinesState } = useMachineState("subscribed", [uuid]);
    const { handleAxiosError } = useErrorHandler();
    const machine: MachineState = { ...machineData, ...machinesState[uuid] };

    if (error) {
        if (error.response.status === ERRORS.HTTP_403_FORBIDDEN) throw error;
        handleAxiosError(error);
        return;
    }

    return (
        <Grid
            display="flex"
            p="md"
        >
            <Column
                span={6}
                h="45%"
            >
                <MachineDataDisplay machine={machine} />
            </Column>
            <Column
                span={6}
                h="45%"
            >
                <LogsDisplay />
            </Column>
            <Column
                span={6}
                h="55%"
            >
                <MachineEditForm
                    machine={machine}
                    refresh={refresh}
                />
            </Column>
            <Column
                span={6}
                h="55%"
            >
                <MachineStateChart machine={machine} />
            </Column>
        </Grid>
    );
}

export { MachinePage as default };
