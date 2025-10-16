import { isNotEmpty, useForm } from "@mantine/form";
import useNamespaceTranslation from "../../../hooks/useNamespaceTranslation";
import {
    ActionIcon,
    Autocomplete,
    Button,
    Divider,
    Flex,
    Group,
    Modal,
    NumberInput,
    Paper,
    Radio,
    ScrollArea,
    Select,
    Stack,
    TagsInput,
    Text,
    TextInput,
    useModalsStack,
} from "@mantine/core";
import { useEffect, useRef, useState } from "react";
import UserMultiselect from "../../../components/molecules/interactive/UserMultiselect/UserMultiselect";
import { UserInDB } from "../../../types/api.types";
import useFetch from "../../../hooks/useFetch";
import { safeObjectValues } from "../../../utils/misc";
import classes from "./CreateMachineModal.module.css";
import { isNull } from "lodash";
import EnhancedSlider from "../../../components/atoms/interactive/EnhancedSlider/EnhancedSlider";
import { IconCircle, IconCircleCheckFilled, IconMinus, IconPlus } from "@tabler/icons-react";

const CreateMachineModal = ({ opened, onClose, onSubmit }): React.JSX.Element => {
    const { data: users, error: usersError, loading: usersLoading } = useFetch("/users?account_type=client");

    const newDiskNameRef = useRef(null);

    const { t, tns } = useNamespaceTranslation("modals", "create-machine");

    const [configTemplate, setConfigTemplate] = useState<string>("");

    const stack = useModalsStack(["details-page", "source-page", "config-page", "disks-page"]);
    // todo add types
    const form = useForm({
        initialValues: {
            name: "New Machine",
            group: "",
            tags: [],
            assigned_clients: [],
            source_type: "iso",
            source_uuid: null,
            config: {
                ram: 1024,
                vcpu: 1,
            },
            disks: [{ name: "sda", size: 1024, unit: "MiB", type: "type1" }],
            os_disk: 0,
        },
        validate: {
            name: (val) =>
                !/^[\w\s.-]+$/.test(val)
                    ? tns("validation.name-invalid-characters")
                    : !/[a-zA-Z]/.test(val[0])
                    ? tns("validation.name-invalid-first")
                    : val.length < 3
                    ? tns("validation.name-too-short")
                    : val.length > 24
                    ? tns("validation.name-too-long")
                    : null,
            group: (val) =>
                !/^[\w\s.-]+$/.test(val)
                    ? tns("validation.group-invalid-characters")
                    : !/[a-zA-Z]/.test(val[0])
                    ? tns("validation.group-invalid-first")
                    : val.length < 3
                    ? tns("validation.group-too-short")
                    : val.length > 24
                    ? tns("validation.group-too-long")
                    : null,
            source_uuid: isNotEmpty("validation.source-uuid-empty"),
            disks: {
                name: (val) =>
                    /\s/.test(val)
                        ? tns("validation.name-spaces")
                        : !/^[\w.-]+$/.test(val)
                        ? tns("validation.name-invalid-characters")
                        : !/[a-zA-Z]/.test(val[0])
                        ? tns("validation.name-invalid-first")
                        : val.length < 3
                        ? tns("validation.name-too-short")
                        : val.length > 24
                        ? tns("validation.name-too-long")
                        : null,
            },
        },
    });

    useEffect(() => {
        if (opened) {
            form.reset();
            setConfigTemplate("");
            stack.open("details-page");
        } else stack.closeAll();
    }, [opened]);

    useEffect(() => {
        setConfigTemplate("");
    }, [JSON.stringify(form.values.config)]);

    const validateDetailsPage = () => {
        form.validateField("name");
        form.validateField("group");
        return form.isValid("name") && form.isValid("group");
    };

    const validateSourcePage = () => {
        form.validateField("source_uuid");
        return form.isValid("source_uuid");
    };

    const validateDisksPage = () => {
        // ! fix disk validation
        form.validateField("disks");
        return form.isValid("disks");
    };

    const resetSourcePage = () => {
        form.resetField("source_type");
        form.resetField("source_uuid");
    };

    const resetConfigPage = () => {
        setConfigTemplate("");
        form.resetField("config");
    };

    const resetDisksPage = () => {
        form.resetField("disks");
    };

    const onTemplateChange = (value: string | null) => {
        setConfigTemplate(value);

        // todo replace with actual template values
        form.setFieldValue("config", { ram: 1024, vcpu: 1 });
    };

    const createNewDisk = () => {
        form.setFieldValue("disks", (prev) => [...prev, { name: "", size: 0, unit: "MiB", type: "type1" }]);
    };

    const removeDisk = (index: number) => {
        form.setFieldValue("disks", (prev) => prev.filter((_, i) => i !== index));
        form.setFieldValue("os_disk", (prev) => (prev >= index ? prev - 1 : prev));
    };

    const canRemoveDisk = (index: number) => form.values.disks.length <= 1 || form.values.os_disk === index;

    const submit = () => {
        // send request
        onClose();
        onSubmit?.();
    };

    return (
        <Modal.Stack>
            <Modal
                {...stack.register("details-page")}
                title={tns("title")}
                onClose={onClose}
            >
                <Stack>
                    <TextInput
                        placeholder={tns("machine-name-placeholder")}
                        description={tns("machine-name")}
                        defaultValue="New Machine"
                        w={300}
                        classNames={{ input: "borderless" }}
                        key={form.key("name")}
                        {...form.getInputProps("name")}
                    />
                    <Group align="top">
                        <Autocomplete
                            placeholder={tns("machine-group-placeholder")}
                            description={tns("machine-group")}
                            w={300}
                            data={["Server", "Desktop"]}
                            classNames={{ input: "borderless" }}
                            key={form.key("group")}
                            {...form.getInputProps("group")}
                        />
                        <TextInput
                            description={tns("machine-group-no")}
                            classNames={{ input: "borderless" }}
                            w={50}
                            value="0"
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
                        disabled
                    />
                    <UserMultiselect
                        placeholder={form.values.assigned_clients.length ? "" : tns("assigned-clients-placeholder")}
                        description={tns("assigned-clients")}
                        users={(safeObjectValues(users) ?? []) as UserInDB[]}
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
                            onClick={() => {
                                if (validateDetailsPage()) {
                                    stack.open("source-page");
                                    stack.close("details-page");
                                }
                            }}
                        >
                            {t("next")}
                        </Button>
                    </Group>
                </Stack>
            </Modal>
            <Modal
                {...stack.register("source-page")}
                title={tns("title")}
                onClose={onClose}
            >
                <Stack>
                    <Radio.Group
                        label={tns("source-type")}
                        description={tns("source-type-description")}
                        key={form.key("source_type")}
                        {...form.getInputProps("source_type")}
                    >
                        <Group mt="xs">
                            <Radio
                                value="iso"
                                label={tns("iso-file")}
                            />
                            <Radio
                                value="snapshot"
                                label={tns("machine-snapshot")}
                            />
                        </Group>
                    </Radio.Group>
                    <Select
                        label={tns(`select-${form.values.source_type}`)}
                        placeholder={tns("none-selected")}
                        classNames={{ input: "borderless" }}
                        data={["dummy"]}
                        key={form.key("source_uuid")}
                        {...form.getInputProps("source_uuid")}
                    />
                    <Group
                        justify="center"
                        mt="lg"
                    >
                        <Button
                            className={classes.closeButton}
                            onClick={() => {
                                resetSourcePage();
                                stack.open("details-page");
                                stack.close("source-page");
                            }}
                        >
                            {t("previous")}
                        </Button>
                        <Button
                            variant="white"
                            className={classes.nextButton}
                            onClick={() => {
                                if (validateSourcePage()) {
                                    stack.open("config-page");
                                    stack.close("source-page");
                                }
                            }}
                        >
                            {t("next")}
                        </Button>
                    </Group>
                </Stack>
            </Modal>
            <Modal
                {...stack.register("config-page")}
                title={tns("title")}
                onClose={onClose}
            >
                <Stack>
                    <Select
                        description={tns("config-template")}
                        placeholder={isNull(configTemplate) ? tns("none-selected") : ""}
                        classNames={{ input: "borderless" }}
                        data={[
                            { value: "", label: "Custom" },
                            { value: "dummy", label: "dummy" },
                        ]}
                        value={configTemplate}
                        onChange={onTemplateChange}
                        allowDeselect={false}
                    />
                    <Divider />
                    <Text fw="500">{tns("configuration")}</Text>
                    <EnhancedSlider
                        heading={tns("ram")}
                        label={(val) => tns("ram-unit", { count: val })}
                        w="250"
                        size="sm"
                        color="cyan.7"
                        thumbSize="12"
                        styles={{ thumb: { border: "none" } }}
                        max={4096}
                        key={form.key("config.ram")}
                        {...form.getInputProps("config.ram")}
                    />

                    <EnhancedSlider
                        heading={tns("vcpu")}
                        label={(val) => tns("vcpu-unit", { count: val })}
                        w="250"
                        size="sm"
                        color="pink.7"
                        thumbSize="12"
                        styles={{ thumb: { border: "none" } }}
                        min={1}
                        max={8}
                        key={form.key("config.vcpu")}
                        {...form.getInputProps("config.vcpu")}
                    />

                    <Group
                        justify="center"
                        mt="lg"
                    >
                        <Button
                            className={classes.closeButton}
                            onClick={() => {
                                resetConfigPage();
                                stack.open("source-page");
                                stack.close("config-page");
                            }}
                        >
                            {t("previous")}
                        </Button>
                        <Button
                            variant="white"
                            className={classes.nextButton}
                            onClick={() => {
                                stack.open("disks-page");
                                stack.close("config-page");
                            }}
                        >
                            {t("next")}
                        </Button>
                    </Group>
                </Stack>
            </Modal>
            <Modal
                {...stack.register("disks-page")}
                title={tns("title-disks")}
                styles={{ title: { fontWeight: 500, fontSize: 20 } }}
                onClose={onClose}
                size="680px"
            >
                <Stack>
                    <Text
                        size="sm"
                        c="dimmed"
                    >
                        {tns("description-disks")}
                    </Text>
                    <Paper
                        bd="var(--mantine-color-dark-6) solid 2px"
                        p="md"
                    >
                        <ScrollArea.Autosize h="300px">
                            <Stack>
                                <Group
                                    mb="-12px"
                                    gap="sm"
                                >
                                    <Flex
                                        w="36"
                                        justify="center"
                                        fz="sm"
                                        fw="600"
                                    >
                                        #
                                    </Flex>
                                    <Flex
                                        w="36"
                                        justify="center"
                                        fz="sm"
                                        fw="600"
                                    >
                                        OS
                                    </Flex>
                                    <Flex
                                        w="180"
                                        justify="left"
                                        fz="sm"
                                        fw="600"
                                        pl="2"
                                    >
                                        {tns("drive-name")}
                                    </Flex>
                                    <Flex
                                        w="164"
                                        justify="left"
                                        fz="sm"
                                        fw="600"
                                        pl="2"
                                    >
                                        {tns("drive-size")}
                                    </Flex>
                                    <Flex
                                        w="80"
                                        justify="left"
                                        fz="sm"
                                        fw="600"
                                        pl="2"
                                    >
                                        {tns("drive-type")}
                                    </Flex>
                                </Group>
                                {form.values.disks.map((_, i) => (
                                    <Group
                                        align="center"
                                        key={i}
                                        gap="sm"
                                    >
                                        <ActionIcon
                                            variant="default"
                                            size="36px"
                                            color="white"
                                            className="borderless"
                                            onClick={() => removeDisk(i)}
                                            disabled={canRemoveDisk(i)}
                                        >
                                            <IconMinus />
                                        </ActionIcon>
                                        <ActionIcon
                                            variant="default"
                                            size="36px"
                                            color="white"
                                            className="borderless"
                                            onClick={() => form.setFieldValue("os_disk", i)}
                                        >
                                            {form.values.os_disk === i ? <IconCircleCheckFilled /> : <IconCircle />}
                                        </ActionIcon>
                                        <TextInput
                                            ref={form.values.disks.length - 1 === i ? newDiskNameRef : null}
                                            classNames={{ input: "borderless" }}
                                            key={form.key(`disks.${i}.name`)}
                                            {...form.getInputProps(`disks.${i}.name`)}
                                        />
                                        <Group gap="4">
                                            <NumberInput
                                                w={80}
                                                min={1}
                                                max={1024}
                                                hideControls
                                                classNames={{ input: "borderless" }}
                                                styles={{
                                                    input: {
                                                        borderRadius: "var(--mantine-radius-md) 0 0 var(--mantine-radius-md)",
                                                    },
                                                }}
                                                key={form.key(`disks.${i}.size`)}
                                                {...form.getInputProps(`disks.${i}.size`)}
                                            />
                                            <Select
                                                w={80}
                                                data={["MiB", "GiB"]}
                                                classNames={{ input: "borderless" }}
                                                allowDeselect={false}
                                                styles={{
                                                    input: {
                                                        borderRadius: "0 var(--mantine-radius-md) var(--mantine-radius-md) 0",
                                                    },
                                                }}
                                                key={form.key(`disks.${i}.unit`)}
                                                {...form.getInputProps(`disks.${i}.unit`)}
                                            />
                                        </Group>
                                        <Select
                                            w={100}
                                            data={["type1", "type2", "type3"]}
                                            key={form.key(`disks.${i}.type`)}
                                            {...form.getInputProps(`disks.${i}.type`)}
                                            classNames={{ input: "borderless" }}
                                        />
                                    </Group>
                                ))}
                                <Group
                                    align="center"
                                    gap="sm"
                                >
                                    <ActionIcon
                                        variant="default"
                                        size="36px"
                                        className="borderless"
                                        onClick={() => createNewDisk()}
                                    >
                                        <IconPlus />
                                    </ActionIcon>
                                </Group>
                            </Stack>
                        </ScrollArea.Autosize>
                    </Paper>

                    <Group
                        justify="center"
                        mt="lg"
                    >
                        <Button
                            className={classes.closeButton}
                            onClick={() => {
                                resetDisksPage();
                                stack.open("config-page");
                                stack.close("disks-page");
                            }}
                        >
                            {t("previous")}
                        </Button>
                        <Button
                            variant="white"
                            className={classes.nextButton}
                            onClick={() => {
                                if (validateDisksPage()) {
                                    submit();
                                    stack.close("disks-page");
                                }
                            }}
                        >
                            {t("create")}
                        </Button>
                    </Group>
                </Stack>
            </Modal>
        </Modal.Stack>
    );
};

export default CreateMachineModal;
