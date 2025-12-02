import { ActionIcon, Group } from "@mantine/core";
import { IconPlayerPlayFilled, IconPlayerStopFilled, IconTrashXFilled } from "@tabler/icons-react";
import React, { MouseEvent } from "react";
import { useTranslation } from "react-i18next";
import useApi from "../../../hooks/useApi";
import { SimpleState } from "../../../types/api.types";
import classes from "./MachineControlsCell.module.css";
import { useThrottledCallback } from "@mantine/hooks";

export interface MachineControlsCellProps {
    uuid: string;
    state: SimpleState;
    disabled: boolean;
    onRemove: (uuid: string) => void;
}

const MachineControlsCell = ({ uuid, state, disabled = false, onRemove }): React.JSX.Element => {
    const { sendRequest } = useApi();

    const toggleState = useThrottledCallback((e) => {
        e.preventDefault();

        if (state.active) sendRequest("POST", `/machine/stop/${uuid}`);
        else sendRequest("POST", `/machine/start/${uuid}`);
    }, 2000);

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
            onClick={(e) => e.preventDefault()}
        >
            {/* <Button
                variant="light"
                color="cherry"
                size="xs"
                onClick={(e) => e.preventDefault()}
                disabled={disabled || state.fetching || state?.loading || !state?.active}
                className={classes.button}
            >
                {t("connect")}
            </Button> */}

            <ActionIcon
                variant="light"
                size="36"
                color={state.active ? "red.9" : "suse-green.6"}
                disabled={disabled || state.fetching || state.loading}
                onClick={toggleState}
            >
                {state.fetching || state.loading || !state.active ? <IconPlayerPlayFilled size={22} /> : <IconPlayerStopFilled size={22} />}
            </ActionIcon>
            <ActionIcon
                variant="light"
                size="36"
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
