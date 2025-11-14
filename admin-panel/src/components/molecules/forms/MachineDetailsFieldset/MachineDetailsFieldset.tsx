import {
    Fieldset,
    FieldsetProps,
    Group,
    ScrollArea,
    ScrollAreaProps,
    Stack,
    TagsInput,
    TagsInputProps,
    Textarea,
    TextareaProps,
    TextInput,
    TextInputProps,
} from "@mantine/core";
import useNamespaceTranslation from "../../../../hooks/useNamespaceTranslation";
import UserMultiselect, { UserMultiselectProps } from "../../interactive/UserMultiselect/UserMultiselect";
import { merge, values } from "lodash";
import useFetch from "../../../../hooks/useFetch";
import { UserInDB } from "../../../../types/api.types";
import { UseFormReturnType } from "@mantine/form";

export interface MachineDetailsFormRequiredValues {
    title: string;
    tags: string[];
    assigned_clients: string[];
    description: string;
}

export interface MachineDetailsFormProps<T = {}> {
    form: UseFormReturnType<MachineDetailsFormRequiredValues & T>;
    disabled?: boolean;
    props?: {
        scrollArea?: Partial<ScrollAreaProps>;
        fieldset?: Partial<FieldsetProps>;
        inputName?: Partial<TextInputProps>;
        inputNumber?: Partial<TextInputProps>;
        inputTags?: Partial<TagsInputProps>;
        inputAssignedClients?: Partial<UserMultiselectProps>;
        inputDescription?: Partial<TextareaProps>;
    };
    i18nextNamespace?: string;
    i18nextPrefix?: string;
    withoutAssignedClients?: boolean;
}

const MachineDetailsFieldset = <T extends Record<string, any> = {}>({
    form,
    disabled = false,
    withoutAssignedClients = false,
    i18nextNamespace,
    i18nextPrefix,
    props,
}: MachineDetailsFormProps<T>): React.JSX.Element => {
    const { data: users, error: usersError, loading: usersLoading } = useFetch("/users?account_type=client");
    const { tns } = useNamespaceTranslation(i18nextNamespace ?? "pages", i18nextPrefix ?? "machine");

    return (
        <Fieldset
            variant="unstyled"
            {...props?.fieldset}
        >
            <ScrollArea
                h="100%"
                {...props?.scrollArea}
            >
                <Stack>
                    <Group align="top">
                        <TextInput
                            placeholder={tns("machine-name-placeholder")}
                            description={tns("machine-name")}
                            w={300}
                            key={form.key("title")}
                            {...form.getInputProps("title")}
                            {...props?.inputName}
                            classNames={merge({ input: "borderless" }, props?.inputName?.classNames)}
                            readOnly={disabled}
                        />
                        <TextInput
                            description={tns("machine-group-no")}
                            w={50}
                            value="1"
                            readOnly
                            {...props?.inputNumber}
                            classNames={merge({ input: "borderless" }, props?.inputNumber?.classNames)}
                        />
                    </Group>
                    <TagsInput
                        placeholder={form.values.tags.length ? "" : tns("machine-tags-placeholder")}
                        description={tns("machine-tags")}
                        maxLength={12}
                        maxTags={3}
                        w={366}
                        key={form.key("tags")}
                        {...form.getInputProps("tags")}
                        {...props?.inputTags}
                        classNames={merge({ input: "borderless" }, props?.inputTags?.classNames)}
                        readOnly={disabled}
                    />
                    {!withoutAssignedClients && (
                        <UserMultiselect
                            placeholder={form.values.assigned_clients.length ? "" : tns("assigned-clients-placeholder")}
                            description={tns("assigned-clients")}
                            users={values(users) ?? ([] as UserInDB[])}
                            w={366}
                            key={form.key("assigned_clients")}
                            {...form.getInputProps("assigned_clients")}
                            {...props?.inputAssignedClients}
                            classNames={merge({ input: "borderless" }, props?.inputAssignedClients?.classNames)}
                            readOnly={disabled}
                        />
                    )}
                    <Textarea
                        placeholder={tns("machine-description-placeholder")}
                        description={tns("machine-description")}
                        w={366}
                        key={form.key("description")}
                        {...form.getInputProps("description")}
                        {...props?.inputDescription}
                        classNames={merge({ input: "borderless" }, props?.inputDescription?.classNames)}
                        readOnly={disabled}
                    />
                </Stack>
            </ScrollArea>
        </Fieldset>
    );
};

export default MachineDetailsFieldset;
