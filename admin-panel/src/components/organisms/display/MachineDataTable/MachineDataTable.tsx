import { Group, Loader, ScrollArea, Stack, TextInput } from "@mantine/core";
import BadgeGroup from "../../../atoms/display/BadgeGroup/BadgeGroup";
import useNamespaceTranslation from "../../../../hooks/useNamespaceTranslation";
import { MachineState } from "../../../../types/api.types";
import React from "react";
import { chunk } from "lodash";
import { IconCircleFilled } from "@tabler/icons-react";

export interface MachineDataTableProps {
    machine: MachineState;
}

const MachineDataTable = ({ machine }: MachineDataTableProps): React.JSX.Element => {
    const { t, tns } = useNamespaceTranslation("pages", "machine");
    const state = { fetching: machine?.active === undefined, loading: machine.loading, active: machine.active };
    const stateColor = `var(--mantine-color-${state.fetching ? "orange-5" : state.loading ? "yellow-5" : state.active ? "suse-green-5" : "cherry-5"})`;
    const chunkedActiveConnections = chunk(machine.active_connections?.length ? machine.active_connections : [null, null], 2);

    return (
        <ScrollArea>
            <Stack p="md">
                <BadgeGroup
                    items={machine?.tags || []}
                    label={undefined}
                />
                <Group>
                    <TextInput
                        description={tns("state")}
                        classNames={{
                            input: "borderless",
                        }}
                        leftSectionWidth={40}
                        readOnly
                        flex="1"
                        styles={{
                            input: {
                                color: stateColor,
                            },
                        }}
                        leftSection={
                            state.fetching || state.loading ? (
                                <Loader
                                    type="bars"
                                    size="12"
                                    color={stateColor}
                                />
                            ) : (
                                <IconCircleFilled
                                    size={8}
                                    color={stateColor}
                                />
                            )
                        }
                        value={t(state.fetching ? "fetching" : state.loading ? "loading" : state.active ? "online" : "offline")}
                    />
                    <TextInput
                        description={tns("ip-address-port")}
                        classNames={{ input: "borderless" }}
                        flex="1"
                        readOnly
                        value={machine.port && machine.port !== -1 ? `<ip-address>:${machine.port}` : "-"}
                    />
                </Group>
                <TextInput
                    description={tns("domain-path")}
                    classNames={{
                        input: "borderless",
                    }}
                    readOnly
                    value="session.lenovo.lab/<uuid-of-the-machine>"
                />

                {chunkedActiveConnections.map((chunk, i) => (
                    <Group
                        key={i}
                        align="end"
                    >
                        <TextInput
                            description={i === 0 ? tns("active-connections") : ""}
                            classNames={{ input: "borderless" }}
                            readOnly
                            value={chunk[0] ?? "-"}
                            flex="1"
                        />
                        <TextInput
                            classNames={{ input: "borderless" }}
                            readOnly
                            value={chunk[1] ?? "-"}
                            flex="1"
                        />
                    </Group>
                ))}
            </Stack>
        </ScrollArea>
    );
};

export default MachineDataTable;
