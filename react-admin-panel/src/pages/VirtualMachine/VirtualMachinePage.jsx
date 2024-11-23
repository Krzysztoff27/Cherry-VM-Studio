import { Grid } from "@mantine/core";
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import MachineStateChart from "./components/MachineStateChart/MachineStateChart";
import StretchingColumn from "./components/StretchingColumn/StretchingColumn";
import NetworkDataDisplay from "./components/NetworkDataDisplay/NetworkDataDisplay";
import ConsoleDisplay from "./components/ConsoleDisplay/ConsoleDisplay";
import useApiWebSocket from "../../hooks/useApiWebSocket";
import useAuth from "../../hooks/useAuth";

export default function VirtualMachinePage() {
    const { uuid } = useParams();
    const { authOptions } = useAuth();
    
    const { lastJsonMessage, sendCommand } = useApiWebSocket('/ws/vm');
    const [ currentState, setCurrentState] = useState({loading: true});
    
    useEffect(() => {
        sendCommand("SUBSCRIBE", { target: uuid })
    }, [])

    useEffect(() => {
        if(lastJsonMessage?.method === 'DATA') setCurrentState(lastJsonMessage?.body?.[uuid]);
    }, [lastJsonMessage])

    return (
        <Grid display='flex' p='4' pt='0' >
            <StretchingColumn span={6} h='45%'>
                <NetworkDataDisplay uuid={uuid} currentState={currentState} authOptions={authOptions} />
            </StretchingColumn>
            <StretchingColumn span={6} h='45%'>
                <ConsoleDisplay uuid={uuid}/>
            </StretchingColumn>
            <StretchingColumn span={12} h='55%'>
                <MachineStateChart currentState={currentState}/>
            </StretchingColumn>
        </Grid >
    )
}
