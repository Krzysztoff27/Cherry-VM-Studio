import { List, Stack, StackProps, Title } from "@mantine/core";
import { User } from "../../../../types/api.types";
import PERMISSIONS from "../../../../config/permissions.config";
import useNamespaceTranslation from "../../../../hooks/useNamespaceTranslation";
import { PermissionProps } from "../../../../types/components.types";

const PermissionsList = ({ user, ...props }: PermissionProps): React.JSX.Element => {
    const { tns } = useNamespaceTranslation("modals", "edit-account.permissions");
    const hasPermission = permissionMask => (user.permissions & permissionMask) !== 0;

    if (user.account_type === "client")
        return (
            <List
                size="sm"
                c="dark.1"
            >
                <List.Item>{tns("client")}</List.Item>
            </List>
        );

    const bulletpoints = [
        tns(`machines${hasPermission(PERMISSIONS.VIEW_ALL_VMS) ? "-view" : ""}${hasPermission(PERMISSIONS.MANAGE_ALL_VMS) ? "-manage" : ""}`),
        tns(`users-view`),
        hasPermission(PERMISSIONS.MANAGE_ADMIN_USERS) || hasPermission(PERMISSIONS.MANAGE_CLIENT_USERS)
            ? tns(
                  `users-manage${hasPermission(PERMISSIONS.MANAGE_ADMIN_USERS) ? "-administrative" : ""}${
                      hasPermission(PERMISSIONS.MANAGE_CLIENT_USERS) ? "-client" : ""
                  }`
              )
            : null,
        hasPermission(PERMISSIONS.CHANGE_ADMIN_PASSWORD) || hasPermission(PERMISSIONS.CHANGE_CLIENT_PASSWORD)
            ? tns(
                  `users-password${hasPermission(PERMISSIONS.CHANGE_ADMIN_PASSWORD) ? "-administrative" : ""}${
                      hasPermission(PERMISSIONS.CHANGE_CLIENT_PASSWORD) ? "-client" : ""
                  }`
              )
            : null,
    ].filter(e => e);

    return (
        <List
            size="sm"
            c="dark.1"
        >
            {bulletpoints.map((bullet, i) => (
                <List.Item key={i}>{bullet}</List.Item>
            ))}
        </List>
    );
};

export default PermissionsList;
