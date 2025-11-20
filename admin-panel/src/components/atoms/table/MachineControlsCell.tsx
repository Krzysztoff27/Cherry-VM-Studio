import { ActionIcon, Button, Group } from "@mantine/core";
import { IconPlayerPlayFilled, IconPlayerStopFilled, IconSettingsFilled, IconTrashXFilled } from "@tabler/icons-react";
import React, { MouseEvent } from "react";
import { useTranslation } from "react-i18next";
import useApi from "../../../hooks/useApi";
import { SimpleState } from "../../../types/api.types";
import classes from "./MachineControlsCell.module.css";

export interface MachineControlsCellProps {
    uuid: string;
    state: SimpleState;
    disabled: boolean;
    onRemove: (uuid: string) => void;
}

const MachineControlsCell = ({ uuid, state, disabled = false, onRemove }): React.JSX.Element => {
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

    const deleteMachine = async (e: MouseEvent) => {
        e.preventDefault(); // required to prevent entering the machine page
        await sendRequest("DELETE", `/machine/delete/${uuid}`);
        onRemove(uuid);
    };

    return (
        <Group
            gap="xs"
            justify="end"
            flex="1"
        >
            <Button
                variant="light"
                color="cherry"
                size="xs"
                onClick={(e) => e.preventDefault()}
                disabled={disabled || state.fetching || state?.loading || !state?.active}
                className={classes.button}
            >
                {t("connect")}
            </Button>
            <ActionIcon
                variant="light"
                size="md"
                color="suse-green.9"
                disabled={disabled || state.fetching || state?.loading || state?.active}
                onClick={startMachine}
                className={classes.button}
            >
                <IconPlayerPlayFilled size={"28"} />
            </ActionIcon>
            <ActionIcon
                variant="light"
                size="md"
                color="red.9"
                disabled={disabled || state.fetching || state?.loading || !state?.active}
                onClick={stopMachine}
                className={classes.button}
            >
                <IconPlayerStopFilled size={"28"} />
            </ActionIcon>
            <ActionIcon
                variant="light"
                size="md"
                color="red.9"
                disabled={disabled || state.fetching || state?.loading || state?.active}
                onClick={deleteMachine}
                className={classes.button}
            >
                <IconTrashXFilled size={"24"} />
            </ActionIcon>
        </Group>
    );
};

export default MachineControlsCell;
