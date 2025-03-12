import { Group, Title } from "@mantine/core";
import React from "react";
import useNamespaceTranslation from "../../../../hooks/useNamespaceTranslation";

const TableStateHeading = ({ getIsSomeRowsSelected, getIsAllRowsSelected, getCoreRowModel, getSelectedRowModel, getRowCount }): React.JSX.Element => {
    const { tns } = useNamespaceTranslation("pages");

    const areRowsSelected = getIsSomeRowsSelected() || getIsAllRowsSelected();
    const areRowsFiltered = getCoreRowModel().rows.length !== getRowCount();

    const heading = tns(`accounts.controls.${areRowsSelected ? "selected-accounts" : areRowsFiltered ? "filtered-results" : "all-accounts"}`);
    const color = areRowsSelected ? "cherry.2" : "dimmed";
    const amount = areRowsSelected ? getSelectedRowModel().rows.length : getRowCount();

    return (
        <Group>
            <Title order={2}>{heading}</Title>
            <Title
                order={2}
                c={color}
            >
                {amount}
            </Title>
        </Group>
    );
};

export default TableStateHeading;
