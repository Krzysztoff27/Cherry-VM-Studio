import { ActionIcon, Button, Group } from "@mantine/core";
import { IconPlayerPlayFilled, IconPlayerStopFilled, IconSettingsFilled, IconTrashXFilled } from "@tabler/icons-react";
import React from "react";
import { useTranslation } from "react-i18next";
import useApiWebSocket from "../../../hooks/useApiWebSocket";

const MachineControlsCell = ({ uuid, state, disabled = false }): React.JSX.Element => {
    const { t } = useTranslation();
    const { sendCommand } = useApiWebSocket("/ws/vm");

    const preventEvent = (e) => e.preventDefault();

    const startMachine = (e) => {
        preventEvent(e);
        sendCommand("START", { uuid });
    };

    const stopMachine = (e) => {
        preventEvent(e);
        sendCommand("STOP", { uuid });
    };

    return (
        <Group
            gap="xs"
            justify="end"
            flex="1"
        >
            <Button
                variant="light"
                color="gray"
                size="xs"
                onClick={preventEvent}
                disabled={disabled || state.fetching || state?.loading || !state?.active}
            >
                {t("connect")}
            </Button>
            <ActionIcon
                variant="light"
                size="md"
                color="suse-green.9"
                disabled={disabled || state.fetching || state?.loading || state?.active}
                onClick={startMachine}
            >
                <IconPlayerPlayFilled size={"28"} />
            </ActionIcon>
            <ActionIcon
                variant="light"
                size="md"
                color="red.9"
                disabled={disabled || state.fetching || state?.loading || !state?.active}
                onClick={stopMachine}
            >
                <IconPlayerStopFilled size={"28"} />
            </ActionIcon>
            <ActionIcon
                variant="light"
                size="md"
                color="dark.0"
                disabled={disabled || state.fetching || state?.loading || state?.active}
                onClick={preventEvent}
            >
                <IconSettingsFilled />
            </ActionIcon>
            <ActionIcon
                variant="light"
                size="md"
                color="red.9"
                disabled={disabled || state.fetching || state?.loading || state?.active}
                onClick={preventEvent}
            >
                <IconTrashXFilled size={"24"} />
            </ActionIcon>
        </Group>
    );
};

export default MachineControlsCell;
