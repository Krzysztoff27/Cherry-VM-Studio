import { Group, Stack } from "@mantine/core";
import { getCoreRowModel, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, useReactTable } from "@tanstack/react-table";
import { useMemo, useState } from "react";
import useNamespaceTranslation from "../../../../hooks/useNamespaceTranslation";
import TanstackTableBody from "../../../molecules/display/TanstackTableBody/TanstackTableBody";
import TableStateHeading from "../../../molecules/feedback/TableStateHeading/TableStateHeading";
import TableControls from "../../../molecules/interactive/TableControls/TableControls";
import TablePagination from "../../../molecules/interactive/TablePagination/TablePagination";
import classes from "./IsoTable.module.css";
import { getColumns } from "./tableConfig";
import { safeObjectValues } from "../../../../utils/misc";
import IsoFileImportModal from "../../../../modals/iso-file-library/IsoFileImportModal/IsoFileImportModal";
import DeleteIsoModal from "../../../../modals/iso-file-library/DeleteIsoModal/DeleteIsoModal";

const IsoTable = ({ data, loading, error, refresh, openIsoFileModal }): React.JSX.Element => {
    const { tns } = useNamespaceTranslation("pages", "iso.controls.");
    const [columnFilters, setColumnsFilters] = useState([]);
    const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });

    const columns = useMemo(() => getColumns(refresh, openIsoFileModal), []);
    const tableData = useMemo(() => safeObjectValues(data), [data]);

    const table = useReactTable({
        data: tableData,
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
                            all: tns("all-files"),
                            selected: tns("selected-files"),
                            filtered: tns("filtered-results"),
                        }}
                    />
                    <TableControls
                        table={table}
                        modals={{
                            create: {
                                component: IsoFileImportModal,
                                props: { onSubmit: refresh },
                            },
                            delete: {
                                component: DeleteIsoModal,
                                props: { uuids: selectedUuids, onSubmit: onDelete },
                            },
                        }}
                        translations={{
                            create: tns("add-iso-file"),
                            import: tns("import"),
                            filter: tns("filters"),
                            delete: tns("delete-selected"),
                        }}
                        withImports={false}
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

export default IsoTable;
