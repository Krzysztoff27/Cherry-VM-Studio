import { Badge, Group, Stack, Text } from "@mantine/core";
import React from "react";
import MachineActivityIndicator from "../feedback/MachineActivityIndicator/MachineActivityIndicator";

const MachineDetailsCell = ({ getValue }): React.JSX.Element => {
    const { state, name, tags } = getValue();

    return (
        <Group gap="md">
            <MachineActivityIndicator state={state} />
            <Stack gap="0">
                <Text
                    tt="capitalize"
                    size="xl"
                >
                    {name}
                </Text>
                {tags?.map?.((tag: string) => (
                    <Badge variant="Light">{tag}</Badge>
                ))}
            </Stack>
        </Group>
    );
};

export default MachineDetailsCell;
