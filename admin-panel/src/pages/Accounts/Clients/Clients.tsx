import React from "react";
import AccountTable from "../../../components/organisms/AccountTable/AccountTable";
import { Paper, Stack } from "@mantine/core";
import classes from "./Clients.module.css";
import DateDifferenceCell from "../../../components/atoms/table/DateDifferenceCell";
import RolesCell from "../../../components/atoms/table/RolesCell";
import BusinessCardCell from "../../../components/atoms/table/BusinessCardCell";
import { safeObjectValues } from "../../../utils/misc";
import CheckboxHeader from "../../../components/atoms/table/CheckboxHeader";
import CheckboxCell from "../../../components/atoms/table/CheckboxCell";
import AccountOptionsCell from "../../../components/atoms/table/AccountOptionsCell";
import useFetch from "../../../hooks/useFetch";
import Loading from "../../../components/atoms/feedback/Loading/Loading";
import useNamespaceTranslation from "../../../hooks/useNamespaceTranslation";

const Clients = (): React.JSX.Element => {
    const { tns } = useNamespaceTranslation("pages");

    const { data, error, loading, refresh } = useFetch("/users?account_type=client");

    const tableData = safeObjectValues(data).map(({ uuid, username, name, surname, email, groups = [] }) => ({
        uuid,
        groups,
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
            cell: BusinessCardCell,
            sortingFn: (rowA: any, rowB: any, columndId: string) => rowB.getValue(columndId)?.name.localeCompare(rowA.getValue(columndId)?.name),
            filterFn: (row: any, columnId: string, filterValue: string) => row.getValue(columnId)?.name?.toLowerCase().startsWith(filterValue.toLowerCase()),
        },
        {
            accessorKey: "groups",
            header: tns("accounts.table.headers.groups"),
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
                    accountType="client"
                    refreshData={refresh}
                />
            </Paper>
        </Stack>
    );
};

export default Clients;
