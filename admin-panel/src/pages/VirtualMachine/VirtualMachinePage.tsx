import { Grid } from "@mantine/core";
import { useParams } from "react-router-dom";
import MachineStateChart from "../../components/molecules/display/MachineStateChart/MachineStateChart.tsx";
import StretchingColumn from "../../components/atoms/layout/StretchingColumn/StretchingColumn.jsx";
import LogsDisplay from "../../components/molecules/display/LogsDisplay/LogsDisplay.jsx";
import useAuth from "../../hooks/useAuth.ts";
import useMachineState from "../../hooks/useMachineState.ts";
import { MachineState } from "../../types/api.types.ts";
import MachineDataDisplay from "../../components/templates/MachineDataDisplay/MachineDataDisplay.jsx";

export default function VirtualMachinePage() {
    const { uuid } = useParams();
    const { authOptions } = useAuth();
    const { machinesState } = useMachineState(uuid);
    const currentState: MachineState = machinesState[uuid] || {
        uuid: uuid,
        active: false,
        loading: true,
    };

    return (
        <Grid display='flex' p='4' pt='0' >
            <StretchingColumn span={6} h='45%'>
                <MachineDataDisplay uuid={uuid} currentState={currentState} authOptions={authOptions} />
            </StretchingColumn>
            <StretchingColumn span={6} h='45%'>
                <LogsDisplay/>
            </StretchingColumn>
            <StretchingColumn span={12} h='55%'>
                <MachineStateChart currentState={currentState}/>
            </StretchingColumn>
        </Grid >
    )
}
