import {
    IconCategory,
    IconChartCohort,
    IconDatabase,
    IconDeviceDesktop,
    IconHome,
    IconSquare,
    IconSquares,
    IconSquaresFilled,
    IconTopologyStar,
    IconUserHexagon,
    IconUsers,
    IconUsersGroup,
} from "@tabler/icons-react";
import { Page } from "../types/config.types";

const PAGES: Page[] = [
    {
        key: "home",
        path: "/home",
        icon: IconHome,
    },
    {
        key: "machines",
        path: "/machines",
        icon: IconDeviceDesktop,
        subpages: [
            {
                key: "your-library",
                path: "/machines",
                icon: IconCategory,
            },
            {
                key: "all-machines",
                path: "/machines/all",
                icon: IconDatabase,
            },
        ],
    },
    {
        key: "accounts",
        path: "/accounts",
        icon: IconUsersGroup,
        subpages: [
            {
                key: "administrators",
                path: "/accounts/admins",
                icon: IconUserHexagon,
            },
            {
                key: "clients",
                path: "/accounts/clients",
                icon: IconUsers,
            },
            {
                key: "groups",
                path: "/accounts/groups",
                icon: IconUsersGroup,
            },
        ],
    },
    {
        key: "network-panel",
        path: "/network-panel",
        icon: IconTopologyStar,
    },
];

export default PAGES;
