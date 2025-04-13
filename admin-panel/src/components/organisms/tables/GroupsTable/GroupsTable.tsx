import { Group, Stack } from "@mantine/core";
import { getCoreRowModel, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, useReactTable } from "@tanstack/react-table";
import { useMemo, useState } from "react";
import classes from "./GroupsTable.module.css";
import { getColumns } from "./tableConfig.jsx";
import useNamespaceTranslation from "../../../../hooks/useNamespaceTranslation.js";
import CreateGroupModal from "../../../../modals/account/CreateGroupModal/CreateGroupModal.jsx";
import DeleteGroupsModal from "../../../../modals/account/DeleteGroupsModal/DeleteGroupsModal.jsx";
import { safeObjectValues } from "../../../../utils/misc.js";
import TanstackTableBody from "../../../molecules/display/TanstackTableBody/TanstackTableBody.jsx";
import TableStateHeading from "../../../molecules/feedback/TableStateHeading/TableStateHeading.jsx";
import TableControls from "../../../molecules/interactive/TableControls/TableControls.jsx";
import TablePagination from "../../../molecules/interactive/TablePagination/TablePagination.jsx";

const GroupsTable = ({ groupData, error, loading, refresh, openGroupModal }): React.JSX.Element => {
    const { tns } = useNamespaceTranslation("pages", "accounts.controls");

    const [columnFilters, setColumnsFilters] = useState([]);
    const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });

    const data = useMemo(
        () =>
            safeObjectValues(groupData).map(({ uuid, name, users }) => ({
                uuid,
                details: name,
                count: users.length,
                users,
            })),
        [groupData]
    );

    const columns = useMemo(() => getColumns(refresh, openGroupModal), [refresh, openGroupModal]);

    const table = useReactTable({
        data: data,
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
        setPagination(prev => ({ ...prev, pageIndex: 0 }));
    };

    const onDelete = () => {
        refresh();
        table.toggleAllRowsSelected(false);
    };

    const selectedUuids = table.getSelectedRowModel().rows.map(row => row.id);

    return (
        <Stack className={classes.container}>
            <Stack className={classes.top}>
                <Group justify="space-between">
                    <TableStateHeading
                        {...table}
                        loading={loading}
                        translations={{
                            all: tns("all-groups"),
                            selected: tns("selected-groups"),
                            filtered: tns("filtered-results"),
                        }}
                    />
                    <TableControls
                        table={table}
                        onFilteringChange={onFilteringChange}
                        modals={{
                            create: {
                                component: CreateGroupModal,
                                props: { onSubmit: refresh },
                            },
                            delete: {
                                component: DeleteGroupsModal,
                                props: { uuids: selectedUuids, onSubmit: onDelete },
                            },
                        }}
                        translations={{
                            create: tns("create-group"),
                            delete: tns("delete-selected"),
                            filter: tns("filters"),
                            import: tns("import"),
                        }}
                    />
                </Group>
            </Stack>
            <TanstackTableBody
                table={table}
                error={error}
                loading={loading}
            />
            <TablePagination
                pagination={pagination}
                setPagination={setPagination}
                getPageCount={table.getPageCount}
            />
        </Stack>
    );
};

export default GroupsTable;
