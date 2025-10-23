import { getCoreRowModel, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, useReactTable } from "@tanstack/react-table";
import { useState } from "react";
import classes from "./TanstackTable.module.css";
import { Group, Stack } from "@mantine/core";
import TableStateHeading, { TableStateHeadingProps } from "../../feedback/TableStateHeading/TableStateHeading";
import TableControls from "../../interactive/TableControls/TableControls";
import TanstackTableBody from "../TanstackTableBody/TanstackTableBody";
import TablePagination from "../../interactive/TablePagination/TablePagination";
import { merge } from "lodash";
import { TableControlsProps } from "../../interactive/TableControls/TableControls.types";

export interface TanstackTableProps {
    loading: boolean;
    error: Response | null;
    data: Array<any>;
    columns: Array<any>;
    headingProps: Omit<TableStateHeadingProps, "table" | "loading">;
    controlsProps: Omit<TableControlsProps, "table" | "onFilteringChange">;
    refresh: () => void;
    RowComponent?: React.ComponentType<any>;
    rowProps?: (uuid: string) => Record<string, any>;
}

const TanstackTable = ({
    data,
    columns,
    loading,
    error,
    refresh,
    headingProps,
    controlsProps,
    RowComponent,
    rowProps,
}: TanstackTableProps): React.JSX.Element => {
    const [columnFilters, setColumnsFilters] = useState([]);
    const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });

    const table = useReactTable({
        data,
        columns: columns,
        state: {
            columnFilters,
            pagination,
        },
        getRowId: (row: any) => row.uuid,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
    });

    const onFilteringChange = (callback: (prev: any) => any) => {
        setColumnsFilters(callback);
        setPagination((prev) => ({ ...prev, pageIndex: 0 }));
    };

    const onDelete = () => {
        refresh();
        table.toggleAllRowsSelected(false);
    };

    const selectedUuids = table.getSelectedRowModel().rows.map((row) => row.id);

    return (
        <Stack className={classes.container}>
            <Stack className={classes.top}>
                <Group justify="space-between">
                    <TableStateHeading
                        table={table}
                        loading={loading}
                        {...headingProps}
                    />
                    <TableControls
                        table={table}
                        onFilteringChange={onFilteringChange}
                        {...controlsProps}
                        modals={merge(
                            controlsProps.modals,
                            controlsProps.modals?.delete && { delete: { props: { uuids: selectedUuids, onSubmit: onDelete } } }
                        )}
                    />
                </Group>
            </Stack>
            <TanstackTableBody
                table={table}
                loading={loading}
                error={error}
                RowComponent={RowComponent}
                rowProps={rowProps}
            />
            <TablePagination
                pagination={pagination}
                setPagination={setPagination}
                getPageCount={table.getPageCount}
            />
        </Stack>
    );
};

export default TanstackTable;
