import { Group, Stack } from "@mantine/core";
import { getCoreRowModel, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, useReactTable } from "@tanstack/react-table";
import { useMemo, useState } from "react";
import useNamespaceTranslation from "../../../../hooks/useNamespaceTranslation";
import TanstackTableBody from "../../../molecules/display/TanstackTableBody/TanstackTableBody";
import TableStateHeading from "../../../molecules/feedback/TableStateHeading/TableStateHeading";
import TableControls from "../../../molecules/interactive/TableControls/TableControls";
import TablePagination from "../../../molecules/interactive/TablePagination/TablePagination";
import classes from "./SnapshotsTable.module.css";
import { getColumns } from "./tableConfig";
import { values } from "lodash";
import { safeObjectValues } from "../../../../utils/misc";

const SnapshotsTable = ({ snapshotData, loading, error, refresh }): React.JSX.Element => {
    const { tns } = useNamespaceTranslation("pages", "snapshots.controls.");
    const [columnFilters, setColumnsFilters] = useState([]);
    const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });

    const columns = useMemo(() => getColumns(), []);
    const data = useMemo(() => safeObjectValues(snapshotData), [snapshotData]);

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
                        {...table}
                        loading={loading}
                        translations={{
                            all: tns("all-snapshots"),
                            selected: tns("selected-snapshots"),
                            filtered: tns("filtered-results"),
                        }}
                    />
                    <TableControls
                        table={table}
                        modals={{}}
                        translations={{
                            import: tns("import"),
                            filter: tns("filters"),
                            delete: tns("delete-selected"),
                        }}
                        withCreation={false}
                        onFilteringChange={onFilteringChange}
                        searchColumnKey="name"
                    />
                </Group>
            </Stack>
            <TanstackTableBody
                table={table}
                loading={loading}
                error={error}
            />
            <TablePagination
                pagination={pagination}
                setPagination={setPagination}
                getPageCount={table.getPageCount}
            />
        </Stack>
    );
};

export default SnapshotsTable;
