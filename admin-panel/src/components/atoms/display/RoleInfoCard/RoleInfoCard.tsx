import { Stack, Text, Title } from "@mantine/core";
import { RoleInDB } from "../../../../types/api.types";
import PERMISSIONS from "../../../../config/permissions.config";
import useNamespaceTranslation from "../../../../hooks/useNamespaceTranslation";
import { safeObjectKeys } from "../../../../utils/misc";

export default function RoleInfoCard({ role }: { role: RoleInDB }) {
    const { tns } = useNamespaceTranslation("pages", "accounts");

    if (!role) return;

    const roleHasPermission = (required: number) => (role.permissions | required) == role.permissions;

    let description = `${tns("permissions.intro")} `;
    let matched = [];

    // for each group it chooses the first mask that matches
    const groupedPermissionKeys = [
        {
            [PERMISSIONS.MANAGE_ALL_VMS]: "permissions.manage-machines",
            [PERMISSIONS.VIEW_ALL_VMS]: "permissions.view-machines",
        },
        {
            [PERMISSIONS.MANAGE_CLIENT_USERS | PERMISSIONS.MANAGE_ADMIN_USERS]: "permissions.manage-all-accounts",
            [PERMISSIONS.MANAGE_CLIENT_USERS]: "permissions.manage-client-accounts",
            [PERMISSIONS.MANAGE_ADMIN_USERS]: "permissions.manage-administrative-accounts",
        },
        {
            [PERMISSIONS.CHANGE_CLIENT_PASSWORD | PERMISSIONS.CHANGE_ADMIN_PASSWORD]: "permissions.modify-credentials",
            [PERMISSIONS.CHANGE_CLIENT_PASSWORD]: "permissions.modify-clients-credentials",
            [PERMISSIONS.CHANGE_ADMIN_PASSWORD]: "permissions.modify-administrators-credentials",
        },
    ];

    groupedPermissionKeys.forEach(group => {
        const found = safeObjectKeys(group).find((permission: number) => roleHasPermission(permission));
        if (found) {
            console.log(found);
            matched.push(tns(group[found]));
        }
    });

    description += `${matched.join(", ")}.`;

    return (
        <Stack gap="0">
            <Title order={6}>{role.name}</Title>
            <Text
                c="dimmed"
                size="sm"
            >
                {description}
            </Text>
        </Stack>
    );
}
