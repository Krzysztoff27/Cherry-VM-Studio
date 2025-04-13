import { Group, Loader, Text } from "@mantine/core";
import React from "react";
import { timeSince } from "../../../utils/dates";
import { useTranslation } from "react-i18next";

const MachineStateCell = ({ getValue }): React.JSX.Element => {
    const { fetching, loading, active, deployed_at } = getValue();
    const { t } = useTranslation();

    if (loading || fetching) {
        return (
            <Group gap="xs">
                <Text
                    c="dimmed"
                    size="md"
                >
                    {fetching ? t("fetching") : t("loading")}
                </Text>
                <Loader
                    type="dots"
                    size="sm"
                    color="dimmed"
                />
            </Group>
        );
    }

    return (
        <Text
            c="dimmed"
            size="md"
        >
            {active ? `${t("running-for")} ${timeSince(new Date(deployed_at))}` : t("offline")}
        </Text>
    );
};

export default MachineStateCell;
