import { IconDeviceDesktop, IconHome, IconTopologyStar, IconUserHexagon, IconUsers, IconUsersGroup } from "@tabler/icons-react"
import { t } from "i18next";
import PERMISSIONS from "./permissions.config";
import { Page } from "../types/config.types";

const PAGES : Page[] = [
    {
        key: 'home',
        path: '/home',
        icon: IconHome,
    },
    {
        key: 'virtual-machines',
        path: '/virtual-machines',
        icon: IconDeviceDesktop,
    },
    {
        key: 'accounts',
        path: '/accounts',
        icon: IconUsersGroup,
        subpages: [
            {
                key: 'administrators',
                path: '/accounts/admins',
                icon: IconUserHexagon,
            },
            {
                key: 'users',
                path: '/accounts/users',
                icon: IconUsers,
            },
            {
                key: 'groups',
                path: '/accounts/groups',
                icon: IconUsersGroup,
            }
        ]
    },
    {
        key: 'network-panel',
        path: '/network-panel',
        icon: IconTopologyStar,
    }
]

export default PAGES;