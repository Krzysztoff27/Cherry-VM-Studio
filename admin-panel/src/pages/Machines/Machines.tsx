import { Paper, Stack } from "@mantine/core";
import useFetch from "../../hooks/useFetch.ts";
import useMachineState from "../../hooks/useMachineState.ts";
import { mergeObjectPropertiesToArray, safeObjectKeys } from "../../utils/misc.js";
import classes from "./Machines.module.css";
import useMantineNotifications from "../../hooks/useMantineNotifications.jsx";
import { ERRORS } from "../../config/errors.config.js";
import MachinesTable from "../../components/organisms/tables/MachinesTable/MachinesTable.tsx";

export default function MachinesPage({ global = false }: { global?: boolean }) {
    const { sendErrorNotification } = useMantineNotifications();
    const { loading, error, data: machineData, refresh } = useFetch(global ? "machines/global" : "machines");
    const { machinesState } = useMachineState(safeObjectKeys(machineData));

    // merged machine data from network data and state data
    const machines = mergeObjectPropertiesToArray(machinesState, machineData);

    if (loading) return;
    if (error) {
        sendErrorNotification(ERRORS.CVMM_600_UNKNOWN_ERROR);
        console.error(error);
        return;
    }

    console.log(machines);

    return (
        <Stack w="100%">
            <Paper className={classes.tablePaper}>
                <MachinesTable
                    machines={machines}
                    refresh={refresh}
                    loading={loading}
                    error={error}
                    global={global}
                />
            </Paper>
        </Stack>
    );
}
