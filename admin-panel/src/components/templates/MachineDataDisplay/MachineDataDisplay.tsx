import { Stack } from "@mantine/core";
import Loading from "../../atoms/feedback/Loading/Loading.tsx";
import useFetch from "../../../hooks/useFetch.ts";
import MachineHeading from "../../organisms/display/MachineHeading/MachineHeading.tsx";
import MachineDataTable from "../../organisms/display/MachineDataTable/MachineDataTable.tsx";
import { MachineData } from "../../../types/api.types.ts";

export default function MachineDataDisplay({ currentState, uuid }) {
    const { loading, error, data } = useFetch(`/machine/${uuid}`);
    const machine = data as MachineData;

    if (loading) return <Loading />;
    if (error) throw error;

    return (
        <Stack>
            <MachineHeading
                machine={machine}
                currentState={currentState}
            />
            <MachineDataTable
                machine={machine}
                currentState={currentState}
            />
        </Stack>
    );
}
