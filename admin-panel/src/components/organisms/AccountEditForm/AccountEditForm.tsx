import { useEffect } from "react";
import { Stack, Title, Group, TextInput, Button, MultiSelect, Text, Box, ScrollArea } from "@mantine/core";
import { IconLabelFilled, IconAt, IconMail, IconEdit } from "@tabler/icons-react";
import classes from "./AccountEditForm.module.css";
import useNamespaceTranslation from "../../../hooks/useNamespaceTranslation";
import { hasLength, isEmail, useForm } from "@mantine/form";
import useApi from "../../../hooks/useApi";
import useErrorHandler from "../../../hooks/useErrorHandler";
import { ErrorCallbackFunction } from "../../../types/hooks.types";
import useMantineNotifications from "../../../hooks/useMantineNotifications";
import AccountHeading from "../../../components/atoms/display/AccountHeading/AccountHeading";
import usePermissions from "../../../hooks/usePermissions";
import PERMISSIONS from "../../../config/permissions.config";

const AccountEditForm = ({ onCancel, onSubmit, user, openPasswordModal }) => {
    const { t, tns } = useNamespaceTranslation("modals", "account");
    const { putRequest } = useApi();
    const { parseAndHandleError } = useErrorHandler();
    const { sendNotification } = useMantineNotifications();
    const { hasPermissions } = usePermissions();

    const canChangePassword = hasPermissions(user.account_type === "administrative" ? PERMISSIONS.CHANGE_ADMIN_PASSWORD : PERMISSIONS.CHANGE_CLIENT_PASSWORD);

    const form = useForm({
        initialValues: {
            name: "",
            surname: "",
            username: "",
            email: "",
            roles: [],
            groups: [],
        },
        validate: {
            name: hasLength({ max: 50 }, tns("validation.name-too-long")),
            surname: hasLength({ max: 50 }, tns("validation.surname-too-long")),
            username: val =>
                /\s/.test(val)
                    ? tns("validation.username-spaces")
                    : !/^[\w.-]+$/.test(val)
                    ? tns("validation.username-invalid-characters")
                    : !/[a-zA-Z]/.test(val[0])
                    ? tns("validation.username-invalid-first")
                    : val.length < 3
                    ? tns("validation.username-too-short")
                    : val.length > 24
                    ? tns("validation.username-too-long")
                    : null,
            email: isEmail(tns("validation.email-invalid")),
        },
        onValuesChange: values => {
            form.setFieldValue("username", values.username.toLowerCase());
        },
    });

    useEffect(() => {
        form.setValues({
            name: user?.name ?? "",
            surname: user?.surname ?? "",
            username: user?.username ?? "",
            email: user?.email ?? "",
            roles: user?.roles ?? [],
            groups: user?.groups ?? [],
        });
    }, [JSON.stringify(user)]);

    const onPostError: ErrorCallbackFunction = (response, json) => {
        if (response.status != 409) parseAndHandleError(response, json);
        if (/username/.test(json?.detail)) form.setFieldError("username", tns("validation.username-duplicate"));
        else if (/email/.test(json?.detail)) form.setFieldError("email", tns("validation.email-duplicate"));
    };

    const onFormSubmit = form.onSubmit(async values => {
        const res = await putRequest(`user/modify/${user?.uuid}`, JSON.stringify(values), undefined, onPostError);
        if (!res) return;

        sendNotification("account.modified", undefined, { username: res.username });
        onSubmit?.();
    });

    return (
        <form
            onSubmit={onFormSubmit}
            style={{ position: "relative" }}
        >
            <Box className={classes.topBox} />
            <Stack className={classes.container}>
                <AccountHeading user={user} />

                <ScrollArea
                    offsetScrollbars
                    type="always"
                    scrollbarSize="0.65rem"
                >
                    <Stack className={classes.content}>
                        <Title
                            order={4}
                            className={classes.sectionTitle}
                        >
                            {tns("account-details")}
                        </Title>
                        <Group className={classes.inputGroup}>
                            <Text className={classes.label}>{tns("name-surname")}</Text>
                            <TextInput
                                leftSection={<IconLabelFilled size={20} />}
                                key={form.key("name")}
                                {...form.getInputProps("name")}
                                className={classes.input}
                            />
                            <TextInput
                                className={classes.input}
                                key={form.key("surname")}
                                {...form.getInputProps("surname")}
                            />
                        </Group>

                        <Group className={classes.inputGroup}>
                            <Text className={classes.label}>{tns("username")}</Text>
                            <TextInput
                                leftSection={<IconAt size={20} />}
                                key={form.key("username")}
                                {...form.getInputProps("username")}
                                className={classes.input}
                            />
                        </Group>
                        <Group className={classes.inputGroup}>
                            <Text className={classes.label}>{tns("email")}</Text>
                            <TextInput
                                leftSection={<IconMail size={20} />}
                                key={form.key("email")}
                                {...form.getInputProps("email")}
                                className={classes.input}
                            />
                        </Group>
                        <Group className={classes.inputGroup}>
                            <Text className={classes.label}>{tns("password")}</Text>
                            <Button
                                variant="default"
                                leftSection={<IconEdit size={20} />}
                                rightSection={<></>}
                                flex="1"
                                onClick={() => openPasswordModal(user.uuid)}
                                disabled={!canChangePassword}
                            >
                                {tns("change-password")}
                            </Button>
                            <Button
                                flex={1}
                                style={{ visibility: "hidden" }}
                            />
                        </Group>

                        {user?.account_type === "administrative" ? (
                            <>
                                <Title
                                    order={4}
                                    className={classes.sectionTitle}
                                >
                                    {tns("roles-and-permissions")}
                                </Title>
                                <MultiSelect
                                    placeholder={tns("roles")}
                                    key={form.key("roles")}
                                    {...form.getInputProps("roles")}
                                    className={classes.input}
                                />
                            </>
                        ) : (
                            <>
                                <Title
                                    order={4}
                                    className={classes.sectionTitle}
                                >
                                    {tns("groups")}
                                </Title>
                                <MultiSelect
                                    placeholder={tns("groups")}
                                    key={form.key("groups")}
                                    {...form.getInputProps("groups")}
                                    className={classes.input}
                                />
                            </>
                        )}
                    </Stack>
                </ScrollArea>

                <Group className={classes.buttonGroup}>
                    <Button
                        variant="light"
                        color="gray"
                        onClick={onCancel}
                        className={classes.cancelButton}
                    >
                        {t("cancel")}
                    </Button>
                    <Button
                        type="submit"
                        variant="white"
                        c="black"
                        className={classes.saveButton}
                    >
                        {t("save")}
                    </Button>
                </Group>
            </Stack>
        </form>
    );
};

export default AccountEditForm;
