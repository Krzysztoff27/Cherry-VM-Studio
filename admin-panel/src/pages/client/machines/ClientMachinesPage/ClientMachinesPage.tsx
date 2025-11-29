import { keys } from "lodash";
import useFetch from "../../../../hooks/useFetch";
import useMachineState from "../../../../hooks/useMachineState";
import useMantineNotifications from "../../../../hooks/useMantineNotifications";
import { ERRORS } from "../../../../config/errors.config";
import { Paper, ScrollArea, Stack } from "@mantine/core";
import classes from "./ClientMachinesPage.module.css";
import MachinesGrid from "../../../../components/molecules/display/MachinesGrid/MachinesGrid";

const ClientMachinesPage = (): React.JSX.Element => {
    const { sendErrorNotification } = useMantineNotifications();
    const { loading, error, data: machinesData, refresh } = useFetch("machines");
    const { machinesState, setMachinesState } = useMachineState("account");

    if (error) {
        sendErrorNotification(ERRORS.CVMM_600_UNKNOWN_ERROR);
        console.error(error);
        return null;
    }

    const machines = loading ? {} : { ...machinesData, ...machinesState };

    return (
        <Stack className={classes.container}>
            <Paper className={classes.tablePaper}>
                <MachinesGrid
                    machines={machines}
                    loading={loading}
                    error={error}
                />
            </Paper>
        </Stack>
    );
};

export default ClientMachinesPage;
