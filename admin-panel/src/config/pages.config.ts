import {
    IconCategory,
    IconDatabase,
    IconDeviceDesktop,
    IconHome,
    IconLibrary,
    IconTemplate,
    IconTopologyStar,
    IconUserHexagon,
    IconUsers,
    IconUsersGroup,
} from "@tabler/icons-react";
import { Page } from "../types/config.types";
import PERMISSIONS from "./permissions.config";
import IconFileTypeIso from "../components/atoms/icons/IconFileTypeIso/IconFileTypeIso";

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
                permissions: PERMISSIONS.VIEW_ALL_VMS,
            },
            {
                key: "templates",
                path: "/machines/templates",
                icon: IconTemplate,
            },
            {
                key: "snapshots",
                path: "/machines/snapshots",
                icon: IconLibrary,
                disabled: true,
            },
            {
                key: "iso",
                path: "/machines/iso",
                icon: IconFileTypeIso,
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
        disabled: true,
    },
];

export default PAGES;
