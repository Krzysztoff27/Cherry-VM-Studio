import { Avatar, Button, Group, Modal, MultiSelect, SimpleGrid, Stack, Text, TextInput } from "@mantine/core";
import classes from "./CreateGroupModal.module.css";
import useNamespaceTranslation from "../../../hooks/useNamespaceTranslation";
import { hasLength, useForm } from "@mantine/form";
import useApi from "../../../hooks/useApi";
import { IconUsersGroup } from "@tabler/icons-react";
import useFetch from "../../../hooks/useFetch";
import { safeObjectValues } from "../../../utils/misc";
import BusinessCard from "../../../components/atoms/display/BusinessCard/BusinessCard";
import useErrorHandler from "../../../hooks/useErrorHandler";
import { ErrorCallbackFunction } from "../../../types/hooks.types";
import useMantineNotifications from "../../../hooks/useMantineNotifications";

export default function CreateGroupModal({ opened, onClose, onSubmit }): React.JSX.Element {
    const { t, tns } = useNamespaceTranslation("modals");
    const { postRequest } = useApi();
    const { parseAndHandleError } = useErrorHandler();
    const { sendNotification } = useMantineNotifications();
    const { data: users, error, loading } = useFetch("users?account_type=client");

    const form = useForm({
        initialValues: {
            name: "",
            users: [],
        },

        validate: {
            name: val =>
                val.length < 3 ? tns("create-group.validation.name-too-short") : val.length > 50 ? tns("create-group.validation.name-too-long") : null,
            users: val => !val.length && tns("create-group.validation.clients-too-few"),
        },
    });

    const closeModal = () => {
        form.reset();
        onClose();
    };

    const onPostError: ErrorCallbackFunction = (response, json) => {
        if (response.status != 409) parseAndHandleError(response, json);
        if (/name/.test(json?.detail)) form.setFieldError("name", tns("create-group.validation.name-duplicate"));
    };

    const onFormSubmit = form.onSubmit(async values => {
        const res = await postRequest("group/create", JSON.stringify(values), undefined, onPostError);
        if (!res) return;

        sendNotification("group.created", undefined, { name: res.name });
        closeModal();
        onSubmit?.();
    });

    const options = safeObjectValues(users).map(({ uuid, name, surname, username }) => ({
        value: uuid,
        label: name || surname ? `${name} ${surname}` : username,
    }));

    const renderOption = ({ option }) => (
        <BusinessCard
            name={`${users[option.value].name} ${users[option.value].surname}`}
            size="sm"
        />
    );

    return (
        <Modal
            opened={opened}
            onClose={closeModal}
            title={tns("create-group.title")}
            size="480"
        >
            <form onSubmit={onFormSubmit}>
                <Stack className={classes.container}>
                    <Group
                        wrap="nowrap"
                        gap="sm"
                    >
                        <Avatar color="cherry">
                            <IconUsersGroup />
                        </Avatar>
                        <Text size="sm">{tns("create-group.description")}</Text>
                    </Group>
                    <Stack gap="xs">
                        <TextInput
                            description={tns("create-group.name-note")}
                            placeholder={tns("create-group.name")}
                            w={300}
                            bd="none"
                            key={form.key("name")}
                            {...form.getInputProps("name")}
                        />
                        <MultiSelect
                            placeholder="Pick clients"
                            nothingFoundMessage={loading ? t("loading") : error ? tns("create-group.error-clients") : false}
                            data={options}
                            renderOption={renderOption}
                            searchable
                            hidePickedOptions
                            rightSection={<></>}
                            classNames={{
                                dropdown: `border`,
                                input: classes.clientsInput,
                            }}
                            comboboxProps={{
                                transitionProps: { transition: "pop", duration: 200 },
                            }}
                            key={form.key("users")}
                            {...form.getInputProps("users")}
                        />
                    </Stack>

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
