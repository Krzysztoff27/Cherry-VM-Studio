import { Grid } from "@mantine/core";
import { useParams } from "react-router-dom";
import MachineStateChart from "../../components/molecules/display/MachineStateChart/MachineStateChart.tsx";
import LogsDisplay from "../../components/molecules/display/LogsDisplay/LogsDisplay.jsx";
import useMachineState from "../../hooks/useMachineState.ts";
import { MachineData, MachineState } from "../../types/api.types.ts";
import useFetch from "../../hooks/useFetch.ts";
import MachineEditForm from "../../components/organisms/forms/MachineEditForm/MachineEditForm.tsx";
import Column from "../../components/atoms/layout/Column/Column.tsx";
import MachineDataDisplay from "../../components/templates/MachineDataDisplay/MachineDataDisplay.tsx";
import useErrorHandler from "../../hooks/useErrorHandler.ts";
import { ERRORS } from "../../config/errors.config.ts";

export default function Machine() {
    const { uuid } = useParams();
    const { data: machineData, loading, error } = useFetch<MachineData>(`machine/${uuid}`);
    const { machinesState } = useMachineState(uuid);
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
                <MachineEditForm machine={machine} />
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
