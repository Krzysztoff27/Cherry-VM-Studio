import { Avatar, Button, Group, Modal, MultiSelect, PasswordInput, Popover, rem, Select, SimpleGrid, Stack, TextInput } from "@mantine/core";
import classes from "./CreateAccountModal.module.css";
import useNamespaceTranslation from "../../../hooks/useNamespaceTranslation";
import { hasLength, isEmail, matchesField, useForm } from "@mantine/form";
import { useState } from "react";
import PasswordInputWithStrength from "../../../components/molecules/interactive/PasswordInputWithStrength/PasswordInputWithStrength";
import useApi from "../../../hooks/useApi";
import { ErrorCallbackFunction } from "../../../types/hooks.types";
import useErrorHandler from "../../../hooks/useErrorHandler";
import useMantineNotifications from "../../../hooks/useMantineNotifications";

export default function CreateAccountModal({ opened, onClose, onSubmit, accountType }): React.JSX.Element {
    const [fullName, setFullName] = useState("");
    const { t, tns } = useNamespaceTranslation("modals");
    const { postRequest } = useApi();
    const { parseAndHandleError } = useErrorHandler();
    const { sendNotification } = useMantineNotifications();

    const form = useForm({
        initialValues: {
            name: "",
            surname: "",
            username: "",
            email: "",
            password: "",
            confirmPassword: "",
            roles: [],
            groups: [],
        },

        validate: {
            name: hasLength({ max: 50 }, tns("create-account.validation.name-too-long")),
            surname: hasLength({ max: 50 }, tns("create-account.validation.surname-too-long")),
            username: val =>
                /\s/.test(val)
                    ? tns("create-account.validation.username-spaces")
                    : !/^[\w.-]+$/.test(val)
                    ? tns("create-account.validation.username-invalid-characters")
                    : !/[a-zA-Z]/.test(val[0])
                    ? tns("create-account.validation.username-invalid-first")
                    : val.length < 3
                    ? tns("create-account.validation.username-too-short")
                    : val.length > 24
                    ? tns("create-account.validation.username-too-long")
                    : null,
            email: isEmail(tns("create-account.validation.email-invalid")),
            password: val =>
                val.length < 10
                    ? tns("create-account.validation.password-too-short")
                    : !/[0-9]/.test(val)
                    ? tns("create-account.validation.password-no-number")
                    : !/[a-z]/.test(val)
                    ? tns("create-account.validation.password-no-lowercase")
                    : !/[A-Z]/.test(val)
                    ? tns("create-account.validation.password-no-uppercase")
                    : !/[$&+,:;=?@#|'<>.^*()%!_-]/.test(val)
                    ? tns("create-account.validation.password-no-special")
                    : null,
            confirmPassword: matchesField("password", tns("create-account.validation.passwords-not-equal")),
        },
    });

    const closeModal = () => {
        form.reset();
        onClose();
    };

    const onFormChange = () => {
        const vals = form.getValues();
        setFullName(`${vals.name} ${vals.surname}`);
    };

    const onPostError: ErrorCallbackFunction = (response, json) => {
        if (response.status != 409) parseAndHandleError(response, json);
        if (/username/.test(json?.detail)) form.setFieldError("username", tns("create-account.validation.username-duplicate"));
        else if (/email/.test(json?.detail)) form.setFieldError("email", tns("create-account.validation.email-duplicate"));
    };

    const onFormSubmit = form.onSubmit(async ({ confirmPassword: _, ...values }) => {
        const res = await postRequest("user/create", JSON.stringify({ account_type: accountType, ...values }), undefined, onPostError);
        if (!res) return;

        sendNotification("account.created", undefined, { username: res.username });
        closeModal();
        onSubmit?.();
    });

    return (
        <Modal
            opened={opened}
            onClose={closeModal}
            onChange={onFormChange}
            title={tns("create-account.title")}
            size="480"
        >
            <form onSubmit={onFormSubmit}>
                <Stack className={classes.container}>
                    <Group
                        align="top"
                        justify="space-between"
                    >
                        <Stack>
                            <TextInput
                                placeholder={t("name")}
                                w={300}
                                classNames={{ input: "borderless" }}
                                key={form.key("name")}
                                {...form.getInputProps("name")}
                            />
                            <TextInput
                                placeholder={t("surname")}
                                w={300}
                                classNames={{ input: "borderless" }}
                                key={form.key("surname")}
                                {...form.getInputProps("surname")}
                            />
                            <TextInput
                                placeholder={t("username")}
                                w={300}
                                key={form.key("username")}
                                classNames={{ input: "borderless" }}
                                {...form.getInputProps("username")}
                            />
                            <TextInput
                                placeholder={t("email")}
                                w={300}
                                key={form.key("email")}
                                classNames={{ input: "borderless" }}
                                {...form.getInputProps("email")}
                            />
                        </Stack>
                        <Avatar
                            name={fullName}
                            size={rem(128)}
                            color={fullName.length > 1 && "initials"}
                        />
                    </Group>
                    <PasswordInputWithStrength
                        label={tns("create-account.account-password")}
                        placeholder={tns("create-account.password-placeholder")}
                        key={form.key("password")}
                        {...form.getInputProps("password")}
                        classNames={{ input: "borderless" }}
                        flex="3"
                    />
                    <PasswordInput
                        label={tns("create-account.confirm-password")}
                        placeholder={tns("create-account.confirm-password-placeholder")}
                        key={form.key("confirmPassword")}
                        classNames={{ input: "borderless" }}
                        {...form.getInputProps("confirmPassword")}
                    />
                    <Select
                        label={tns("create-account.account-type")}
                        data={[tns(`create-account.account-types.${accountType}`)]}
                        value={tns(`create-account.account-types.${accountType}`)}
                        disabled
                        autoFocus={false}
                    />
                    {accountType === "administrative" ? (
                        <MultiSelect
                            clearable
                            checkIconPosition="left"
                            label={tns("create-account.roles")}
                            data={["Machine Manager", "Account Administrator"]}
                            classNames={{ input: "borderless" }}
                            placeholder={tns("create-account.select-roles")}
                            key={form.key("roles")}
                            {...form.getInputProps("roles")}
                            autoFocus
                        />
                    ) : (
                        <MultiSelect
                            clearable
                            checkIconPosition="left"
                            label={tns("create-account.groups")}
                            data={["4ta2"]}
                            classNames={{ input: "borderless" }}
                            placeholder={tns("create-account.select-groups")}
                            key={form.key("groups")}
                            {...form.getInputProps("groups")}
                            autoFocus
                        />
                    )}
                    <SimpleGrid cols={2}>
                        <Button
                            onClick={closeModal}
                            variant="light"
                            color="cherry.9"
                        >
                            {t("cancel")}
                        </Button>
                        <Button
                            type="submit"
                            variant="light"
                            color="suse-green.8"
                        >
                            {t("confirm")}
                        </Button>
                    </SimpleGrid>
                </Stack>
            </form>
        </Modal>
    );
}
