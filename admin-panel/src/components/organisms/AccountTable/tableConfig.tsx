import { AccountType } from "../../../types/config.types";
import AccountOptionsCell from "../../atoms/table/AccountOptionsCell";
import BusinessCardCell from "../../atoms/table/BusinessCardCell";
import CheckboxCell from "../../atoms/table/CheckboxCell";
import CheckboxHeader from "../../atoms/table/CheckboxHeader";
import DateDifferenceCell from "../../atoms/table/DateDifferenceCell";
import RolesCell from "../../atoms/table/RolesCell";

export const getColumns = (accountType: AccountType, refresh: () => void) => [
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
        sortingFn: (rowA: any, rowB: any, columndId: string) => rowB.getValue(columndId)?.name.localeCompare(rowA.getValue(columndId)?.name),
        filterFn: (row: any, columnId: string, filterValue: string) => row.getValue(columnId)?.name?.toLowerCase().startsWith(filterValue.toLowerCase()),
    },
    {
        administrative: {
            accessorKey: "roles",
            header: "Roles",
            enableSorting: false,
            cell: RolesCell,
        },
        client: {
            accessorKey: "groups",
            header: "Groups",
            enableSorting: false,
            cell: RolesCell,
        },
    }[accountType],
    {
        accessorKey: "lastActive",
        header: "Last Active",
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
