import { ActionIcon, Button, Group } from "@mantine/core";
import { IconPlayerPlayFilled, IconPlayerStopFilled, IconSettingsFilled, IconTrashXFilled } from "@tabler/icons-react";
import React, { MouseEvent } from "react";
import { useTranslation } from "react-i18next";
import useApi from "../../../hooks/useApi";

const MachineControlsCell = ({ uuid, state, disabled = false }): React.JSX.Element => {
    const { t } = useTranslation();
    const { sendRequest } = useApi();

    const startMachine = (e: MouseEvent) => {
        e.preventDefault(); // required to prevent entering the machine page
        sendRequest("POST", `/machine/start/${uuid}`);
    };

    const stopMachine = (e: MouseEvent) => {
        e.preventDefault(); // required to prevent entering the machine page
        sendRequest("POST", `/machine/stop/${uuid}`);
    };

    const deleteMachine = (e: MouseEvent) => {
        e.preventDefault(); // required to prevent entering the machine page
        sendRequest("DELETE", `/machine/delete/${uuid}`);
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
                onClick={(e) => e.preventDefault()}
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
                onClick={(e) => e.preventDefault()}
            >
                <IconSettingsFilled />
            </ActionIcon>
            <ActionIcon
                variant="light"
                size="md"
                color="red.9"
                disabled={disabled || state.fetching || state?.loading || state?.active}
                onClick={deleteMachine}
            >
                <IconTrashXFilled size={"24"} />
            </ActionIcon>
        </Group>
    );
};

export default MachineControlsCell;
