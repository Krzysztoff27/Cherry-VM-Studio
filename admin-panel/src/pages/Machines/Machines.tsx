import { Paper, Stack } from "@mantine/core";
import useFetch from "../../hooks/useFetch.ts";
import useMachineState from "../../hooks/useMachineState.ts";
import { safeObjectKeys } from "../../utils/misc.js";
import classes from "./Machines.module.css";
import useMantineNotifications from "../../hooks/useMantineNotifications.jsx";
import { ERRORS } from "../../config/errors.config.js";
import MachinesTable from "../../components/organisms/tables/MachinesTable/MachinesTable.tsx";

export default function MachinesPage({ global = false }: { global?: boolean }) {
    // to resolve the issue with glitchy switches between global and private machine lists
    return (
        <MachinesPageInner
            key={global ? "global" : "private"}
            global={global}
        />
    );
}

function MachinesPageInner({ global }: { global: boolean }) {
    const { sendErrorNotification } = useMantineNotifications();
    const { loading, error, data: machinesData, refresh } = useFetch(global ? "machines/global" : "machines");
    const { machinesState } = useMachineState(safeObjectKeys(machinesData));

    if (error) {
        sendErrorNotification(ERRORS.CVMM_600_UNKNOWN_ERROR);
        console.error(error);
        return null;
    }

    const machines = loading ? {} : { ...machinesData, ...machinesState };

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
