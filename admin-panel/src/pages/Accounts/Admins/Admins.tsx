import AccountTable from "../../../components/organisms/AccountTable/AccountTable";
import classes from "./Admins.module.css";
import DateDifferenceCell from "../../../components/atoms/table/DateDifferenceCell";
import RolesCell from "../../../components/atoms/table/RolesCell";
import BuisnessCardCell from "../../../components/atoms/table/BusinessCardCell";
import AccountOptionsCell from "../../../components/atoms/table/AccountOptionsCell";
import useNamespaceTranslation from "../../../hooks/useNamespaceTranslation";
import useFetch from "../../../hooks/useFetch";
import { Paper, Stack } from "@mantine/core";
import { safeObjectValues } from "../../../utils/misc";
import CheckboxCell from "../../../components/atoms/table/CheckboxCell";
import CheckboxHeader from "../../../components/atoms/table/CheckboxHeader";
import Loading from "../../../components/atoms/feedback/Loading/Loading";
import { JSX } from "react";

const Admins = (): React.JSX.Element => {
    const { tns } = useNamespaceTranslation("pages");

    const { data, error, loading, refresh } = useFetch("/users?account_type=administrative");

    const tableData = safeObjectValues(data).map(({ uuid, username, name, surname, email, roles }) => ({
        uuid,
        roles,
        lastActive: null,
        details: { username, name, surname, email },
    }));

    const columns = [
        {
            accessorKey: "selection",
            enableSorting: false,
            header: CheckboxHeader,
            cell: CheckboxCell,
        },
        {
            accessorKey: "details",
            header: tns("accounts.table.headers.user"),
            cell: BuisnessCardCell,
            sortingFn: (rowA: any, rowB: any, columndId: string) => rowB.getValue(columndId)?.name.localeCompare(rowA.getValue(columndId)?.name),
            filterFn: (row: any, columnId: string, filterValue: string) => row.getValue(columnId)?.name?.toLowerCase().startsWith(filterValue.toLowerCase()),
        },
        {
            accessorKey: "roles",
            header: tns("accounts.table.headers.roles"),
            enableSorting: false,
            cell: RolesCell,
        },
        {
            accessorKey: "lastActive",
            header: tns("accounts.table.headers.last-active"),
            cell: DateDifferenceCell,
        },
        {
            accessorKey: "options",
            header: "",
            enableSorting: false,
            cell: props => (
                <AccountOptionsCell
                    {...props}
                    refreshData={refresh}
                />
            ),
        },
    ];

    if (error) throw error;
    if (loading) return <Loading />;

    return (
        <Stack w="100%">
            <Paper className={classes.tablePaper}>
                <AccountTable
                    data={tableData}
                    columns={columns}
                    accountType="administrative"
                    refreshData={refresh}
                />
            </Paper>
        </Stack>
    );
};

export default Admins;
