import { ActionIcon, Button, Group } from "@mantine/core";
import { IconPlayerPlayFilled, IconPlayerStopFilled, IconSettingsFilled, IconTrashXFilled } from "@tabler/icons-react";
import React from "react";
import { useTranslation } from "react-i18next";

const MachineControlsCell = ({ state, disabled = false }): React.JSX.Element => {
    const { t } = useTranslation();

    const preventEvent = e => e.preventDefault();

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
                onClick={preventEvent}
            >
                <IconPlayerPlayFilled size={"28"} />
            </ActionIcon>
            <ActionIcon
                variant="light"
                size="md"
                color="red.9"
                disabled={disabled || state.fetching || state?.loading || !state?.active}
                onClick={preventEvent}
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
