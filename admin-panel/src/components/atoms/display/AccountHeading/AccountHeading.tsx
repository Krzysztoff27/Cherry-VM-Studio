import { Avatar, Badge, Box, Group, Stack, Text, Title } from "@mantine/core";
import classes from "./AccountHeading.module.css";
import { useTranslation } from "react-i18next";

const AccountHeading = ({ user }): React.JSX.Element => {
    const { t } = useTranslation();

    return (
        <>
            <Group className={classes.group}>
                <Avatar
                    name={user?.name || user?.surname ? `${user?.name} ${user?.surname}` : user?.username}
                    color="initials"
                    size="96"
                    className={classes.avatar}
                />
                <Stack className={classes.userInfo}>
                    <Title
                        order={2}
                        className={classes.title}
                    >
                        {user?.name || user?.surname ? `${user?.name} ${user?.surname}` : `@${user?.username}`}
                    </Title>
                    <Text className={classes.username}>{`@${user?.username}`}</Text>
                </Stack>
                <Badge
                    variant="outline"
                    color={user?.account_type === "administrative" ? "cherry" : "teal"}
                    size="lg"
                    fw={500}
                    className={classes.badge}
                >
                    {user?.account_type === "administrative" ? t("administrator") : t("client-account")}
                </Badge>
            </Group>
        </>
    );
};

export default AccountHeading;
