import { Group, Loader, Text } from "@mantine/core";
import React from "react";
import { timeSince } from "../../../utils/dates";
import { useTranslation } from "react-i18next";
import { SimpleState } from "../../../types/api.types";

const MachineStateCell = ({ getValue }): React.JSX.Element => {
    const { fetching, loading, active } = getValue();
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
            {t(active ? "online" : "offline")}
            {/* {active ? `${t("running-for")} ${timeSince(new Date(deployed_at))}` : t("offline")} */}
        </Text>
    );
};

export const sortingFunction = (rowA: any, rowB: any, columnId: string) => {
    const stateA: SimpleState = rowA.getValue(columnId);
    const stateB: SimpleState = rowB.getValue(columnId);

    const getPriority = (state: SimpleState) => (state.fetching ? 1 : !state.active && !state.loading ? 2 : state.loading ? 3 : state.active ? 4 : 0);

    return getPriority(stateA) - getPriority(stateB);
};

export default MachineStateCell;
