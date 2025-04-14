import { Avatar, Button, Group, Modal, MultiSelect, PasswordInput, Popover, rem, Select, SimpleGrid, Stack, TextInput } from "@mantine/core";
import classes from "./CreateAccountModal.module.css";
import useNamespaceTranslation from "../../../hooks/useNamespaceTranslation";
import { hasLength, isEmail, matchesField, useForm } from "@mantine/form";
import { useMemo, useState } from "react";
import PasswordInputWithStrength from "../../../components/molecules/interactive/PasswordInputWithStrength/PasswordInputWithStrength";
import useApi from "../../../hooks/useApi";
import { ErrorCallbackFunction } from "../../../types/hooks.types";
import useErrorHandler from "../../../hooks/useErrorHandler";
import useMantineNotifications from "../../../hooks/useMantineNotifications";
import useFetch from "../../../hooks/useFetch";
import { safeObjectValues } from "../../../utils/misc";
import RoleInfoCard from "../../../components/atoms/display/RoleInfoCard/RoleInfoCard";
import RoleMultiselect from "../../../components/atoms/interactive/RoleMultiselect/RoleMultiselect";
import GroupMultiselect from "../../../components/atoms/interactive/GroupMultiselect/GroupMultiselect";

export default function CreateAccountModal({ opened, onClose, onSubmit, accountType }): React.JSX.Element {
    const [fullName, setFullName] = useState("");
    const { t, tns } = useNamespaceTranslation("modals", "account");
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
            password: val =>
                val.length < 10
                    ? tns("validation.password-too-short")
                    : !/[0-9]/.test(val)
                    ? tns("validation.password-no-number")
                    : !/[a-z]/.test(val)
                    ? tns("validation.password-no-lowercase")
                    : !/[A-Z]/.test(val)
                    ? tns("validation.password-no-uppercase")
                    : !/[$&+,:;=?@#|'<>.^*()%!_-]/.test(val)
                    ? tns("validation.password-no-special")
                    : null,
            confirmPassword: matchesField("password", tns("validation.passwords-not-equal")),
        },
        onValuesChange: values => {
            setFullName(values.name || values.surname ? `${values.name} ${values.surname}` : values.username);
            form.setFieldValue("username", values.username.toLowerCase());
        },
    });

    const closeModal = () => {
        form.reset();
        onClose();
    };

    const onPostError: ErrorCallbackFunction = (response, json) => {
        if (response.status != 409) parseAndHandleError(response, json);
        if (/username/.test(json?.detail)) form.setFieldError("username", tns("validation.username-duplicate"));
        else if (/email/.test(json?.detail)) form.setFieldError("email", tns("validation.email-duplicate"));
    };

    const onFormSubmit = form.onSubmit(async ({ confirmPassword: _, ...values }) => {
        const body = { account_type: accountType, ...values };
        if (accountType === "administrative") delete body.groups;
        else if (accountType === "client") delete body.roles;
        console.log(body);

        const res = await postRequest("user/create", JSON.stringify(body), undefined, onPostError);
        if (!res) return;

        sendNotification("account.created", undefined, { username: res.username });
        closeModal();
        onSubmit?.();
    });

    return (
        <Modal
            opened={opened}
            onClose={closeModal}
            title={tns("title-create")}
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
                        label={tns("account-password")}
                        placeholder={tns("password-placeholder")}
                        key={form.key("password")}
                        {...form.getInputProps("password")}
                        classNames={{ input: "borderless" }}
                        flex="3"
                    />
                    <PasswordInput
                        label={tns("confirm-password")}
                        placeholder={tns("confirm-password-placeholder")}
                        key={form.key("confirmPassword")}
                        classNames={{ input: "borderless" }}
                        {...form.getInputProps("confirmPassword")}
                    />
                    <Select
                        label={tns("account-type")}
                        data={[tns(`${accountType}`)]}
                        value={tns(`${accountType}`)}
                        disabled
                        autoFocus={false}
                    />
                    {accountType === "administrative" ? (
                        <RoleMultiselect
                            clearable
                            classNames={{ input: "borderless" }}
                            placeholder={tns("select-roles")}
                            key={form.key("roles")}
                            {...form.getInputProps("roles")}
                            autoFocus
                        />
                    ) : (
                        <GroupMultiselect
                            clearable
                            classNames={{ input: "borderless" }}
                            placeholder={tns("select-groups")}
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
