import { Stack, Paper } from "@mantine/core";
import MachinesTable from "../../../../components/organisms/tables/MachinesTable/MachinesTable";
import { ERRORS } from "../../../../config/errors.config";
import useMachineState from "../../../../hooks/useMachineState";
import useMantineNotifications from "../../../../hooks/useMantineNotifications";
import { safeObjectKeys } from "../../../../utils/misc";
import useFetch from "../../../../hooks/useFetch";
import classes from "./MachinesPage.module.css";
import { isNull, merge, omitBy } from "lodash";
import { MachineData } from "../../../../types/api.types";

export interface MachinesPageProps {
    global?: boolean;
}

// to resolve the issue with glitchy switches between global and private machine lists
const MachinesPage = ({ global = false }: MachinesPageProps): React.JSX.Element => {
    return (
        <MachinesPageInner
            key={global ? "global" : "private"}
            global={global}
        />
    );
};

const MachinesPageInner = ({ global = false }: MachinesPageProps): React.JSX.Element => {
    const { sendErrorNotification } = useMantineNotifications();
    const { loading, error, data: machinesData, refresh } = useFetch<Record<string, MachineData>>(global ? "machines/global" : "machines");
    const { machinesState, setMachinesState } = useMachineState(safeObjectKeys(machinesData));

    if (error) {
        sendErrorNotification(ERRORS.CVMM_600_UNKNOWN_ERROR);
        console.error(error);
        return null;
    }

    const onRemove = (uuid: string) => {
        refresh();
        setMachinesState((prev) => {
            const states = prev;
            delete states[uuid];
            return states;
        });
    };

    const machines = loading ? {} : merge({}, machinesData, omitBy(machinesState, isNull));

    return (
        <Stack w="100%">
            <Paper className={classes.tablePaper}>
                <MachinesTable
                    machines={machines}
                    refresh={refresh}
                    loading={loading}
                    error={error}
                    global={global}
                    onRemove={onRemove}
                />
            </Paper>
        </Stack>
    );
};

export default MachinesPage;
