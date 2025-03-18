import { Group, MantineStyleProp, ScrollArea, Stack, Table, Text } from "@mantine/core";
import React from "react";
import { arrayIntoChunks } from "../../../utils/misc";

function MachineDataTable({ machine, currentState, t }) {
    const keyTdStyle: MantineStyleProp = { textAlign: "right", fontWeight: 500, width: "25%" };

    const activeConnectionsArray =
        currentState?.active_connections?.map((address: string, i: number) => (
            <Text
                fz="lg"
                key={i}
            >
                {address}
            </Text>
        )) || [];
    const activeConnectionsSplit = arrayIntoChunks(activeConnectionsArray, 4);
    const activeConnectionsStacks = activeConnectionsSplit.length
        ? activeConnectionsSplit.map((elements, i) => (
              <Stack
                  gap="sm"
                  key={i}
              >
                  {...elements}
              </Stack>
          ))
        : "None";

    return (
        <ScrollArea>
            <Table
                fz="lg"
                withRowBorders={false}
                striped
            >
                <Table.Tbody>
                    <Table.Tr>
                        <Table.Td style={keyTdStyle}>{t("machine.info.type", { ns: "pages" })}:</Table.Td>
                        <Table.Td tt="capitalize">{`${machine.group} (${machine.group_member_id})`}</Table.Td>
                    </Table.Tr>
                    <Table.Tr>
                        <Table.Td style={keyTdStyle}>{t("machine.info.domain", { ns: "pages" })}:</Table.Td>
                        <Table.Td>
                            <a href={`http://${machine.domain}`}>{machine.domain}</a>
                        </Table.Td>
                    </Table.Tr>
                    <Table.Tr>
                        <Table.Td style={keyTdStyle}>{t("machine.info.address", { ns: "pages" })}:</Table.Td>
                        <Table.Td>
                            <a href={`http://172.16.100.1:${machine.port}`}>172.16.100.1:{machine.port}</a>
                        </Table.Td>
                    </Table.Tr>
                    <Table.Tr>
                        <Table.Td style={{ verticalAlign: "top", ...keyTdStyle }}>{t("machine.info.active-connections", { ns: "pages" })}:</Table.Td>
                        <Table.Td>
                            <Group align="top">{activeConnectionsStacks}</Group>
                        </Table.Td>
                    </Table.Tr>
                </Table.Tbody>
            </Table>
        </ScrollArea>
    );
}

export default MachineDataTable;
