import { Paper, ScrollArea, Stack } from "@mantine/core";
import { useMemo } from "react";
import MachineCard from "../../components/organisms/MachineCard/MachineCard.tsx";
import PanelForMachineList from "../../components/organisms/PanelForMachineList/PanelForMachineList.tsx";
import CardGroup from "../../components/templates/CardGroup/CardGroup.tsx";
import useFetch from "../../hooks/useFetch.ts";
import useGroupCookieManager from "../../hooks/useGroupCookieManager.ts";
import useMachineState from "../../hooks/useMachineState.ts";
import groupMachines from "../../utils/groupMachines.js";
import { mergeObjectPropertiesToArray, safeObjectKeys } from "../../utils/misc.js";
import classes from './MachineListPage.module.css';
import useMantineNotifications from "../../hooks/useMantineNotifications.jsx";
import { ERRORS } from "../../assets/errors.js";

export default function MachineListPage() {
    const { sendErrorNotification } = useMantineNotifications();
    const { groupBy, closedGroups, toggleGroup, setGroupBy } = useGroupCookieManager('/virtual-machines');
    const { loading, error, data: machineNetworkData, refresh } = useFetch('/vm/all/networkdata');
    const { machinesState } = useMachineState(safeObjectKeys(machineNetworkData));

    // merged machine data from network data and state data
    const machines = mergeObjectPropertiesToArray(machinesState, machineNetworkData);
    // uses memo to not recalculate groups every time the machine state changes (except for when the groups are based on the state values)
    const groups: Record<string, string[]> = useMemo(() => groupMachines(machines, groupBy), [machineNetworkData, groupBy, groupBy === 'state' ? machinesState : undefined]);

    if (loading) return;
    if (error) {
        sendErrorNotification(ERRORS.CVMM_600_UNKNOWN_ERROR);
        console.error(error);
        return;
    }

    const cardGroups = Object.entries(groups || {}).map(([group, uuids], i) => (
            <CardGroup
                key={i}
                group={group}
                toggleOpened={() => toggleGroup(group)}
                opened={!closedGroups?.includes?.(group)}
            >
                {uuids.map(uuid => (
                    <MachineCard
                        machine={machineNetworkData[uuid]}
                        to={`./${uuid}`}
                        key={uuid}
                        currentState={machinesState?.[uuid]}
                    />
                ))}
            </CardGroup>
        ));


    return (
        <Paper className={classes.pagePaper}>
            <Stack className={classes.pageStack}>
                <PanelForMachineList
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
