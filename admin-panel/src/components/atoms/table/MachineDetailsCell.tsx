import { Group, Indicator, Stack, Text } from "@mantine/core";
import { IconDeviceDesktop } from "@tabler/icons-react";
import React from "react";

const MachineDetailsCell = ({ getValue }): React.JSX.Element => {
    const { state, name } = getValue();

    return (
        <Group gap="md">
            <Indicator
                position="bottom-end"
                color={state.fetching ? "orange.6" : state.loading ? "yellow" : state.active ? "suse-green.7" : "cherry"}
                withBorder={true}
                size="12"
            >
                <IconDeviceDesktop
                    size={28}
                    color={!state.active ? "var(--mantine-color-dark-1)" : undefined}
                />
            </Indicator>
            <Stack gap="0">
                <Text
                    tt="capitalize"
                    size="xl"
                >
                    {getValue().name}
                </Text>
                <Text
                    tt="capitalize"
                    size="xs"
                    c="dimmed"
                >
                    Suse-Image-X.Y.Z
                </Text>
            </Stack>
        </Group>
    );
};

export default MachineDetailsCell;
