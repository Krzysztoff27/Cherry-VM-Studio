import { t } from "i18next";
import { AccountType } from "../../../../types/config.types";
import AccountOptionsCell from "../../../atoms/table/AccountOptionsCell";
import BadgesCell from "../../../atoms/table/BadgesCell";
import BusinessCardCell from "../../../atoms/table/BusinessCardCell";
import CheckboxCell from "../../../atoms/table/CheckboxCell";
import CheckboxHeader from "../../../atoms/table/CheckboxHeader";
import DateDifferenceCell from "../../../atoms/table/DateDifferenceCell";

export const getColumns = (accountType: AccountType, refresh: () => void, openAccountModal: () => void, openPasswordModal: () => void) => [
    {
        accessorKey: "selection",
        enableSorting: false,
        header: CheckboxHeader,
        cell: CheckboxCell,
        maxSize: 50,
    },
    {
        accessorKey: "details",
        header: t("accounts.table.headers.name", { ns: "pages" }),
        cell: BusinessCardCell,
        sortingFn: (rowA: any, rowB: any, columndId: string) => rowB.getValue(columndId)?.name.localeCompare(rowA.getValue(columndId)?.name),
        filterFn: (row: any, columnId: string, filterValue: string) => row.getValue(columnId)?.name?.toLowerCase().startsWith(filterValue.toLowerCase()),
        minSize: 300,
    },
    {
        administrative: {
            accessorKey: "roles",
            header: t("accounts.table.headers.roles", { ns: "pages" }),
            enableSorting: false,
            cell: BadgesCell,
            minSize: 400,
        },
        client: {
            accessorKey: "groups",
            header: t("accounts.table.headers.groups", { ns: "pages" }),
            enableSorting: false,
            cell: BadgesCell,
            minSize: 400,
        },
    }[accountType],
    {
        accessorKey: "lastActive",
        header: t("accounts.table.headers.last-active", { ns: "pages" }),
        cell: DateDifferenceCell,
        minSize: 100,
    },
    {
        accessorKey: "options",
        header: "",
        enableSorting: false,
        cell: props => (
            <AccountOptionsCell
                {...props}
                openAccountModal={openAccountModal}
                openPasswordModal={openPasswordModal}
                refreshData={refresh}
                accountType={accountType}
            />
        ),
        maxSize: 50,
    },
];
