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

const Clients = (): React.JSX.Element => {
    const columns = [
        {
            accessorKey: "selection",
            enableSorting: false,
            header: CheckboxHeader,
            cell: CheckboxCell,
        },
        {
            accessorKey: "details",
            header: "Name",
            cell: BusinessCardCell,
            sortingFn: (rowA: any, rowB: any, columndId: string) =>
                rowB.getValue(columndId)?.name.localeCompare(rowA.getValue(columndId)?.name),
            filterFn: (row: any, columnId: string, filterValue: string) =>
                row.getValue(columnId)?.name?.toLowerCase().startsWith(filterValue.toLowerCase()),
        },
        {
            accessorKey: "groups",
            header: "Groups",
            enableSorting: false,
            cell: RolesCell,
        },
        {
            accessorKey: "lastActive",
            header: "Last Active",
            cell: DateDifferenceCell,
        },
        {
            accessorKey: "options",
            header: "",
            enableSorting: false,
            cell: AccountOptionsCell,
        },
    ];

    const { data, error, loading } = useFetch("/users?account_type=client");

    const tableData = safeObjectValues(data).map(({ uuid, username, name, surname, email, groups = [] }) => ({
        uuid,
        groups,
        lastActive: null,
        details: { username, name, surname, email },
    }));

    console.log(error);
    if (loading || error) return;

    return (
        <Stack w="100%">
            <Paper className={classes.tablePaper}>
                <AccountTable
                    columns={columns}
                    tableData={tableData}
                    accountType="clients"
                />
            </Paper>
        </Stack>
    );
};

export default Clients;
