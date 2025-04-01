import { Stack, Group, Text, Box, Button, Title } from "@mantine/core";
import classes from "./AccountDisplay.module.css";
import useNamespaceTranslation from "../../../hooks/useNamespaceTranslation";
import PermissionsList from "../../atoms/display/PermissionsList/PermissionsList";
import BadgeGroup from "../../../components/atoms/display/BadgeGroup/BadgeGroup";
import AccountHeading from "../../../components/atoms/display/AccountHeading/AccountHeading";
import usePermissions from "../../../hooks/usePermissions";
import PERMISSIONS from "../../../config/permissions.config";

const AccountDisplay = ({ onClose, onEdit, user }) => {
    const { t, tns } = useNamespaceTranslation("modals", "account");
    const { hasPermissions } = usePermissions();

    const canEdit = hasPermissions(user.account_type === "administrative" ? PERMISSIONS.MANAGE_ADMIN_USERS : PERMISSIONS.MANAGE_CLIENT_USERS);

    return (
        <Stack pos="relative">
            <Box className={classes.topBox} />
            <Stack className={classes.stack}>
                <AccountHeading user={user} />

                <Stack className={classes.accountDetails}>
                    <Text className={classes.detailLabel}>
                        {tns("email")}:
                        <Text
                            span
                            className={classes.detailValue}
                        >
                            {` ${user?.email}`}
                        </Text>
                    </Text>
                    <Text className={classes.detailLabel}>
                        {tns("creation-date")}:
                        <Text
                            span
                            className={classes.detailValue}
                        >
                            {` ${user?.creation_date}`}
                        </Text>
                    </Text>
                </Stack>

                <Stack ml="md">
                    <Title order={5}>{tns("permissions")}:</Title>
                    <PermissionsList user={user} />
                </Stack>
                {user?.account_type === "administrative" ? (
                    <BadgeGroup
                        label={`${tns("roles")}:`}
                        items={user?.roles}
                        emptyMessage={`${t("none")}`}
                    />
                ) : (
                    <BadgeGroup
                        label={`${tns("assigned-groups")}:`}
                        items={user?.groups}
                        emptyMessage={`${t("none")}`}
                    />
                )}
                <Group className={classes.buttonGroup}>
                    <Button
                        className={classes.editButton}
                        variant="white"
                        onClick={onEdit}
                        disabled={!canEdit}
                    >
                        {t("edit")}
                    </Button>
                    <Button
                        className={classes.closeButton}
                        onClick={onClose}
                    >
                        {t("close")}
                    </Button>
                </Group>
            </Stack>
        </Stack>
    );
};

export default AccountDisplay;
