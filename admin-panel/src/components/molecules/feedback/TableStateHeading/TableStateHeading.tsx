import { Group, Title } from "@mantine/core";
import React from "react";

const TableStateHeading = ({ getIsSomeRowsSelected, getIsAllRowsSelected, getCoreRowModel, getSelectedRowModel, getRowCount }): React.JSX.Element => {
    const areRowsSelected = getIsSomeRowsSelected() || getIsAllRowsSelected();
    const areRowsFiltered = getCoreRowModel().rows.length !== getRowCount();

    const heading = areRowsSelected ? "Selected accounts" : areRowsFiltered ? "Filtered results" : "All accounts";
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
