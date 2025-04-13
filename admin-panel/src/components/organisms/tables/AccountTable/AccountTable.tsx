import { Group, Stack } from "@mantine/core";
import { getCoreRowModel, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, useReactTable } from "@tanstack/react-table";
import { useMemo, useState } from "react";
import PERMISSIONS from "../../../../config/permissions.config";
import useNamespaceTranslation from "../../../../hooks/useNamespaceTranslation";
import usePermissions from "../../../../hooks/usePermissions";
import CreateAccountModal from "../../../../modals/account/CreateAccountModal/CreateAccountModal";
import DeleteAccountsModal from "../../../../modals/account/DeleteAccountsModal/DeleteAccountsModal";
import { safeObjectValues } from "../../../../utils/misc";
import TanstackTableBody from "../../../molecules/display/TanstackTableBody/TanstackTableBody";
import TableStateHeading from "../../../molecules/feedback/TableStateHeading/TableStateHeading";
import TableControls from "../../../molecules/interactive/TableControls/TableControls";
import TablePagination from "../../../molecules/interactive/TablePagination/TablePagination";
import classes from "./AccountTable.module.css";
import { getColumns } from "./tableConfig";
import { IconTrash, IconUserPlus } from "@tabler/icons-react";

const AccountTable = ({ accountType, userData, loading, refresh, error, openAccountModal, openPasswordModal }): React.JSX.Element => {
    const { hasPermissions } = usePermissions();
    const { tns } = useNamespaceTranslation("pages", "accounts.controls.");
    const [columnFilters, setColumnsFilters] = useState([]);
    const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });

    const columns = useMemo(() => getColumns(accountType, refresh, openAccountModal, openPasswordModal), [accountType]);
    const data = useMemo(
        () =>
            safeObjectValues(userData).map(user => ({
                uuid: user.uuid,
                roles: user?.roles?.map(role => role.name),
                groups: user?.groups?.map(group => group.name),
                lastActive: user.last_active,
                details: {
                    username: user.username,
                    name: user.name,
                    surname: user.surname,
                    email: user.email,
                },
            })),
        [userData]
    );

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
                            all: tns("all-accounts"),
                            selected: tns("selected-accounts"),
                            filtered: tns("filtered-results"),
                        }}
                    />
                    <TableControls
                        table={table}
                        viewMode={!hasPermissions(accountType === "administrative" ? PERMISSIONS.MANAGE_ADMIN_USERS : PERMISSIONS.MANAGE_CLIENT_USERS)}
                        icons={{
                            create: IconUserPlus,
                        }}
                        modals={{
                            create: {
                                component: CreateAccountModal,
                                props: { accountType, onSubmit: refresh },
                            },
                            delete: {
                                component: DeleteAccountsModal,
                                props: { uuids: selectedUuids, onSubmit: onDelete },
                            },
                        }}
                        translations={{
                            create: tns("create-account"),
                            delete: tns("delete-selected"),
                            import: tns("import"),
                            filter: tns("filters"),
                        }}
                        onFilteringChange={onFilteringChange}
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

export default AccountTable;
