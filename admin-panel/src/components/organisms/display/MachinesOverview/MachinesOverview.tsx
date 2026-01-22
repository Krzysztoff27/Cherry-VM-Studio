import { Button, Group, Paper, Stack, Title } from "@mantine/core";
import useNamespaceTranslation from "../../../../hooks/useNamespaceTranslation";
import useFetch from "../../../../hooks/useFetch";
import { MachineData } from "../../../../types/api.types";
import { keys } from "lodash";
import useMachineState from "../../../../hooks/useMachineState";
import { useNavigate } from "react-router-dom";
import useMantineNotifications from "../../../../hooks/useMantineNotifications";
import { ERRORS } from "../../../../config/errors.config";
import classes from "./MachinesOverview.module.css";
import { IconExternalLink } from "@tabler/icons-react";
import MachinesGrid from "../../../molecules/display/MachinesGrid/MachinesGrid";

const MachinesOverview = (): React.JSX.Element => {
    const { t, tns } = useNamespaceTranslation("pages", "client-home");

    const { sendErrorNotification } = useMantineNotifications();
    const navigate = useNavigate();

    const { loading, error, data: machinesData, refresh } = useFetch<MachineData>("machines");
    const { machinesState, setMachinesState } = useMachineState("account");

    if (error) {
        sendErrorNotification(ERRORS.CVMM_600_UNKNOWN_ERROR);
        console.error(error);
        return null;
    }

    const machines = loading ? {} : { ...machinesData, ...machinesState };

    return (
        <Stack className={classes.overviewContainer}>
            <Group className={classes.overviewControls}>
                <Title
                    order={2}
                    c="white"
                >
                    {tns("machine-overview")}
                </Title>
                <Button
                    variant="white"
                    c="black"
                    rightSection={
                        <IconExternalLink
                            size={18}
                            stroke={3}
                        />
                    }
                    size="sm"
                    fw="600"
                    onClick={() => navigate("/admin/machines")}
                >
                    {tns("view-all")}
                </Button>
            </Group>
            <Paper className={classes.overviewPaper}>
                <MachinesGrid
                    machines={machines}
                    error={error}
                    loading={loading}
                    rows={1}
                />
            </Paper>
        </Stack>
    );
};

export default MachinesOverview;
