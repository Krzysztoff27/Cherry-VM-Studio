import { useEffect, useMemo, useState } from "react";
import { useCookies } from "react-cookie";
import { Paper, ScrollArea, Stack } from "@mantine/core";
import { mergeObjectPropertiesToArray, safeObjectKeys, safeObjectValues, toggleInArray } from "../../utils/misc.js";
import groupMachines from "../../utils/groupMachines.js";
import CardGroup from "./components/CardGroup/CardGroup.jsx";
import MachineCard from "./components/MachineCard/MachineCard.jsx";
import MachineListPanel from "./components/MachineListPanel/MachineListPanel.jsx";
import useFetch from "../../hooks/useFetch.jsx";
import useAuth from "../../hooks/useAuth.jsx";
import useErrorHandler from "../../hooks/useErrorHandler.jsx";
import classes from './MachineList.module.css';
import useApiWebSocket from "../../hooks/useApiWebSocket.jsx";

const useGroupCookieManager = () => {
    const [cookies, setCookies] = useCookies(['groupBy', 'closedGroups']);
    const groupBy = cookies.groupBy || 'group';
    const closedGroups = cookies.closedGroups || [];

    // setters for cookies
    const clearClosedGroups = () => setCookies('closedGroups', [], {path: '/virtual-machines'})
    const toggleGroup = (group) => setCookies('closedGroups', toggleInArray(closedGroups, group) , {path: '/virtual-machines'});
    const setGroupBy = (val) => {
        setCookies('groupBy', val, {path: '/virtual-machines'})
        clearClosedGroups();
    }

    return {groupBy, closedGroups, toggleGroup, setGroupBy};
}

const handleCurrentState = (machineNetworkData) => {
    const { lastJsonMessage, sendCommand } = useApiWebSocket('/ws/vm');
    const [ currentState, setCurrentState] = useState({});
    let dataMsg = lastJsonMessage;
    
    useEffect(() => {
        // subscribe to every machine
        safeObjectKeys(machineNetworkData).forEach(uuid => sendCommand("SUBSCRIBE", { target: uuid }));
        // set timeout as the state cooldown, if 2s pass without receiving data (otherwise the entire component would reload), change dataMsg to message with empty body
        setTimeout(() => dataMsg = {method: 'DATA', body: {}}, 2000);
    }, [machineNetworkData])
    
    useEffect(() => {
        if(dataMsg?.method === 'DATA') setCurrentState(dataMsg.body);
    }, [dataMsg])

    return {currentState};
}

export default function MachineList() {
    const { authOptions } = useAuth();
    const { parseAndHandleError } = useErrorHandler(); 
    const { loading, error, data: machineNetworkData, refresh } = useFetch('/vm/all/networkdata', authOptions);
    const { groupBy, closedGroups, toggleGroup, setGroupBy } = useGroupCookieManager();
    const { currentState } = handleCurrentState(machineNetworkData);
    
    // merged machine data from network data and state data
    const machines = mergeObjectPropertiesToArray(currentState, machineNetworkData);
    // uses memo to not recalculate groups every time the machine state changes (except for when the groups are based on the state values)
    const groups = useMemo(() => groupMachines(machines, groupBy), [machineNetworkData, groupBy, groupBy === 'state' ? currentState : undefined]);
    
    if (loading) return;
    if (error) {
        parseAndHandleError(error);
        return;
    }

    const cardGroups = Object.entries(groups || {}).map(([group, machines], i) => (
        <CardGroup 
            key={i} 
            group={group} 
            toggleOpened={() => toggleGroup(group)}
            opened={!closedGroups?.includes?.(group)}
        >
            {machines.map(machine => (
                <MachineCard
                    machine={machine}
                    to={`./${machine.uuid}`}
                    key={machine.uuid}
                    currentState={currentState?.[machine.uuid]}
                />
            ))}
        </CardGroup>
    ))

    return (
        <Paper className={classes.pagePaper}>
            <Stack className={classes.pageStack}>
                <MachineListPanel 
                    groupBy={groupBy} 
                    setGroupBy={setGroupBy}
                    refreshNetworkData={refresh}
                />
                <ScrollArea.Autosize className={classes.scrollArea} >
                    <Stack pb='lg'>
                        {cardGroups}
                    </Stack>
                </ScrollArea.Autosize>
            </Stack>
        </Paper>
    )
}
