import { Button, Group, Stack, TagsInput, TextInput } from "@mantine/core";
import useNamespaceTranslation from "../../../../hooks/useNamespaceTranslation";
import UserMultiselect from "../../../molecules/interactive/UserMultiselect/UserMultiselect";
import { values } from "lodash";
import useFetch from "../../../../hooks/useFetch";
import { UserInDB } from "../../../../types/api.types";
import { UseFormReturnType } from "@mantine/form";
import { CreateMachineFormValues } from "../../../../modals/machines/CreateMachineModal/CreateMachineModal";

interface MachineDetailsFormProps {
    form: UseFormReturnType<CreateMachineFormValues>;
    classes: Record<string, string>;
    onClose: () => void;
    onSubmit: () => void;
}

const MachineDetailsForm = ({ form, classes, onClose, onSubmit }: MachineDetailsFormProps): React.JSX.Element => {
    const { data: users, error: usersError, loading: usersLoading } = useFetch("/users?account_type=client");

    const { t, tns } = useNamespaceTranslation("modals", "create-machine");

    const validateDetailsForm = () => {
        form.validateField("name");
        form.validateField("tags");
        return form.isValid("name") && form.isValid("tags");
    };

    return (
        <Stack>
            <Group align="top">
                <TextInput
                    placeholder={tns("machine-name-placeholder")}
                    description={tns("machine-name")}
                    w={300}
                    classNames={{ input: "borderless" }}
                    key={form.key("name")}
                    {...form.getInputProps("name")}
                />
                <TextInput
                    description={tns("machine-group-no")}
                    classNames={{ input: "borderless" }}
                    w={50}
                    value="1"
                    readOnly
                />
            </Group>
            <TagsInput
                placeholder={form.values.tags.length ? "" : tns("machine-tags-placeholder")}
                description={tns("machine-tags")}
                w={366}
                classNames={{ input: "borderless" }}
                key={form.key("tags")}
                {...form.getInputProps("tags")}
                maxLength={12}
                maxTags={3}
            />
            <UserMultiselect
                placeholder={form.values.assigned_clients.length ? "" : tns("assigned-clients-placeholder")}
                description={tns("assigned-clients")}
                users={(values(users) ?? []) as UserInDB[]}
                classNames={{ input: "borderless" }}
                w={366}
                key={form.key("assigned_clients")}
                {...form.getInputProps("assigned_clients")}
            />
            <Group
                mt="lg"
                justify="center"
            >
                <Button
                    className={classes.closeButton}
                    onClick={onClose}
                >
                    {t("close")}
                </Button>
                <Button
                    variant="white"
                    className={classes.nextButton}
                    onClick={() => validateDetailsForm() && onSubmit()}
                >
                    {t("next")}
                </Button>
            </Group>
        </Stack>
    );
};

export default MachineDetailsForm;
