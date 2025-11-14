import { Button, Checkbox, Group, Modal, NumberInput, Paper, Pill, PillGroup, ScrollArea, Select, Stack, Text } from "@mantine/core";
import classes from "./CreateMachinesInBulkModal.module.css";
import ListInput from "../../../components/atoms/interactive/ListInput/ListInput";
import { useForm } from "@mantine/form";
import { CreateMachineFormValues, CreateMachineModalStack } from "../CreateMachineModal/CreateMachineModal";
import { useEffect, useState } from "react";
import useNamespaceTranslation from "../../../hooks/useNamespaceTranslation";
import { IconAlertCircle, IconDeviceDesktop } from "@tabler/icons-react";
import { values } from "lodash";
import useFetch from "../../../hooks/useFetch";
import { Group as GroupType } from "../../../types/api.types";

interface MachinesField {
    machine: CreateMachineFormValues;
    count: number;
}

export interface CreateMachinesInBulkFormValues {
    machines: MachinesField[];
    group: null | string;
    create_for_group_mode: boolean;
}

export interface CreateMachinesInBulkModalProps {
    opened: boolean;
    onClose: () => void;
    onSubmit: () => void;
}

const CreateMachinesInBulkModal = ({ opened, onSubmit, onClose }: CreateMachinesInBulkModalProps): React.JSX.Element => {
    const { tns, t } = useNamespaceTranslation("modals", "create-machines-in-bulk");
    const { data: groups }: { data: Record<string, GroupType> } = useFetch("/groups");

    const [supportModalOpened, setSupportModalOpened] = useState(false);

    const form = useForm<CreateMachinesInBulkFormValues>({
        initialValues: {
            machines: [],
            group: null,
            create_for_group_mode: false,
        },
        validate: {
            group: (val, values) => (values.create_for_group_mode && !val ? tns("validation.group-not-selected") : null),
        },
    });

    const createEntry = () => {
        setSupportModalOpened(true);
    };

    const onSupportModalClosed = () => {
        setSupportModalOpened(false);
    };

    const addMachine = (machine: CreateMachineFormValues) => {
        form.setFieldValue("machines", (prev) => [...prev, { machine, count: 1 }]);
        onSupportModalClosed();
    };

    const removeMachine = (index: number) => {
        form.setFieldValue("machines", (prev) => prev.filter((_, i) => i !== index));
    };

    const close = () => {
        form.reset();
        onClose();
    };

    const submit = form.onSubmit(async (values) => {
        // send request

        close();
        onSubmit?.();
    });

    const groupsInSelect = values(groups).map((group: GroupType) => ({ label: group.name, value: group.uuid }));

    const numberOfMachines =
        form.values.machines.reduce((prev, curr) => prev + curr.count, 0) *
        (form.values.create_for_group_mode ? groups[form.values.group]?.users?.length ?? 1 : 1);

    return (
        <Group>
            <Modal
                opened={opened}
                onClose={onClose}
                title={tns("title")}
                size="xl"
                classNames={{ title: classes.title }}
            >
                <ScrollArea
                    h="400px"
                    mb="lg"
                    type="always"
                    offsetScrollbars
                >
                    <Text>{tns("set-of-machines")}</Text>
                    <Text className={classes.description}>{tns("description.set-of-machines")}</Text>
                    <Stack className={classes.mainStack}>
                        <Stack gap="xs">
                            <Paper className={classes.formBorder}>
                                {!form.values.machines.length ? (
                                    <Button
                                        className="borderless"
                                        variant="default"
                                        onClick={createEntry}
                                        leftSection={<IconDeviceDesktop size={18} />}
                                    >
                                        {tns("add-first-machine")}
                                    </Button>
                                ) : (
                                    <ListInput
                                        values={form.values.machines}
                                        row={(value: MachinesField, index) => (
                                            <>
                                                <Group className={classes.rowGroup}>
                                                    <Group className={classes.machineDetail}>
                                                        <IconDeviceDesktop size={18} />
                                                        <Text size="sm">{value.machine.title}</Text>
                                                        <PillGroup>
                                                            {value.machine.tags.map((tag) => (
                                                                <Pill>{tag}</Pill>
                                                            ))}
                                                        </PillGroup>
                                                        <Text
                                                            size="sm"
                                                            ml="auto"
                                                            mr="sm"
                                                            c="dimmed"
                                                            tt="capitalize"
                                                        >
                                                            {value.machine.source_type}
                                                        </Text>
                                                    </Group>
                                                </Group>
                                                <NumberInput
                                                    classNames={{ input: "borderless" }}
                                                    w="70px"
                                                    key={form.key(`machines.${index}.count`)}
                                                    {...form.getInputProps(`machines.${index}.count`)}
                                                />
                                            </>
                                        )}
                                        createEntry={createEntry}
                                        removeEntry={removeMachine}
                                    />
                                )}
                            </Paper>
                        </Stack>

                        <Stack gap="0">
                            <Text size="md">{tns("create-for-group")}</Text>
                            <Text className={classes.description}>{tns("description.create-for-group")}</Text>
                            <Paper className={classes.formBorder}>
                                <Stack>
                                    <Checkbox
                                        radius="sm"
                                        label={tns("create-for-group-mode")}
                                        key={form.key("create_for_group_mode")}
                                        {...form.getInputProps("create_for_group_mode")}
                                    />
                                    {form.values.create_for_group_mode && (
                                        <Select
                                            label={tns("select-group")}
                                            data={groupsInSelect}
                                            nothingFoundMessage={t("nothing-found")}
                                            key={form.key("group")}
                                            {...form.getInputProps("group")}
                                        />
                                    )}
                                </Stack>
                            </Paper>
                        </Stack>
                    </Stack>
                </ScrollArea>
                {!!numberOfMachines && (
                    <Group className={classes.warning}>
                        <IconAlertCircle size={18} />
                        <Text size="sm">{tns("number-warning", { count: numberOfMachines })}</Text>
                    </Group>
                )}
                <Group justify="center">
                    <Button
                        className={classes.closeButton}
                        onClick={close}
                    >
                        {t("close")}
                    </Button>
                    <Button
                        variant="white"
                        className={classes.submitButton}
                        onClick={() => submit()}
                    >
                        {t("create")}
                    </Button>
                </Group>
            </Modal>
            <CreateMachineModalStack
                opened={supportModalOpened}
                onClose={onSupportModalClosed}
                onSubmit={addMachine}
            />
        </Group>
    );
};

export default CreateMachinesInBulkModal;
