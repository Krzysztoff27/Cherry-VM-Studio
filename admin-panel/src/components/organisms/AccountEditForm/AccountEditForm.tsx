import { useEffect, useMemo } from "react";
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
import useFetch from "../../../hooks/useFetch";
import { safeObjectValues } from "../../../utils/misc";
import RoleInfoCard from "../../atoms/display/RoleInfoCard/RoleInfoCard";

const AccountEditForm = ({ onCancel, onSubmit, user, openPasswordModal }) => {
    const { t, tns } = useNamespaceTranslation("modals", "account");
    const { putRequest } = useApi();
    const { parseAndHandleError } = useErrorHandler();
    const { sendNotification } = useMantineNotifications();
    const { hasPermissions } = usePermissions();
    const { data: groups } = useFetch("groups");
    const { data: roles } = useFetch("roles");

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

    const resetValues = () =>
        form.setValues({
            name: user?.name ?? "",
            surname: user?.surname ?? "",
            username: user?.username ?? "",
            email: user?.email ?? "",
            roles: user?.roles?.map(role => role.uuid) ?? [],
            groups: user?.groups?.map(group => group.uuid) ?? [],
        });

    useEffect(() => {
        resetValues();
    }, [JSON.stringify(user)]);

    const onPostError: ErrorCallbackFunction = (response, json) => {
        if (response.status == 400) {
            if (/permission unassigned/.test(json?.detail)) {
                const match = json.detail.match(/UUID=([a-f0-9-]+)/i);
                const roleUuid = match ? match[1] : null;
                const roleName = roles[roleUuid].name;
                form.setFieldValue("roles", user?.roles?.map(role => role.uuid) ?? []);
                return form.setFieldError("roles", tns("validation.cannot-revoke-role", { name: roleName }));
            }
        }
        if (response.status == 409) {
            if (/username/.test(json?.detail)) return form.setFieldError("username", tns("validation.username-duplicate"));
            if (/email/.test(json?.detail)) return form.setFieldError("email", tns("validation.email-duplicate"));
        }
        parseAndHandleError(response, json);
    };

    const onFormSubmit = form.onSubmit(async values => {
        console.log(values);
        const res = await putRequest(`user/modify/${user?.uuid}`, JSON.stringify(values), undefined, onPostError);
        if (!res) return;

        sendNotification("account.modified", undefined, { username: res.username });
        onSubmit?.();
    });

    const sortByLabel = (a, b) => a.label.localeCompare(b.label);

    const getLabels = (list: { name: string; uuid: string }[]) =>
        list
            .map(group => ({
                label: group.name,
                value: group.uuid,
            }))
            .sort(sortByLabel);

    const groupOptions = getLabels(safeObjectValues(groups));
    const roleOptions = getLabels(safeObjectValues(roles));

    const renderOptions = ({ option, checked }) => <RoleInfoCard role={roles[option.value]} />;

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
                    scrollbars="y"
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
                                    data={roleOptions}
                                    renderOption={renderOptions}
                                    hidePickedOptions={true}
                                    className={classes.input}
                                    comboboxProps={{ position: "top" }}
                                    key={form.key("roles")}
                                    {...form.getInputProps("roles")}
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
                                    data={groupOptions}
                                    renderOption={renderOptions}
                                    hidePickedOptions={true}
                                    className={classes.input}
                                    comboboxProps={{ position: "top" }}
                                    key={form.key("groups")}
                                    {...form.getInputProps("groups")}
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
