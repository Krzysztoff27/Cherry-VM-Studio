import { Flex, Grid, Group, Modal, NumberInput, Paper, SimpleGrid, Text, TextInput } from "@mantine/core";
import classes from "./CreateMachinesInBulkModal.module.css";
import ListInput from "../../../components/atoms/interactive/ListInput/ListInput";
import { useForm } from "@mantine/form";
import { CreateMachineFormValues, CreateMachineModalStack } from "../CreateMachineModal/CreateMachineModal";
import { useState } from "react";
import useNamespaceTranslation from "../../../hooks/useNamespaceTranslation";
import { IconDeviceDesktop } from "@tabler/icons-react";

interface MachinesField {
    machine: CreateMachineFormValues;
    count: number;
}

export interface CreateMachinesInBulkFormValues {
    machines: MachinesField[];
    group: null | string;
}

export interface CreateMachinesInBulkModalProps {
    opened: boolean;
    onClose: () => void;
    onSubmit: () => void;
}

const CreateMachinesInBulkModal = ({ opened, onSubmit, onClose }: CreateMachinesInBulkModalProps): React.JSX.Element => {
    const { tns } = useNamespaceTranslation("modals", "create-machines-in-bulk");

    const [supportModalOpened, setSupportModalOpened] = useState(false);

    const form = useForm<CreateMachinesInBulkFormValues>({
        initialValues: {
            machines: [],
            group: null,
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
    };

    const removeMachine = (index: number) => {
        form.setFieldValue("machines", (prev) => prev.filter((_, i) => i !== index));
    };

    const submit = () => {
        // send request

        onClose();
        onSubmit?.();
    };

    return (
        <Group>
            <Modal
                opened={opened}
                onClose={onClose}
                title={tns("title")}
                size="xl"
            >
                <Text className={classes.description}>{tns("description")}</Text>
                <Paper className={classes.formBorder}>
                    <ListInput
                        values={form.values.machines}
                        row={(value: MachinesField, index) => (
                            <>
                                <Group
                                    bg="dark.6"
                                    pl="xs"
                                    pr="xs"
                                    h="100%"
                                    align="center"
                                    style={{ borderRadius: "var(--mantine-radius-md)" }}
                                    gap="0"
                                >
                                    <Group
                                        w="200px"
                                        gap="xs"
                                    >
                                        <IconDeviceDesktop size={18} />
                                        <Text size="sm">{value.machine.group}</Text>
                                    </Group>
                                    <Group
                                        w="200px"
                                        gap="xs"
                                    >
                                        <Text
                                            size="xs"
                                            c="dimmed"
                                        >
                                            {value.machine.source_uuid}
                                        </Text>
                                    </Group>
                                </Group>
                                <NumberInput
                                    classNames={{ input: "borderless" }}
                                    key={form.key(`machines.${index}.count`)}
                                    {...form.getInputProps(`machines.${index}.count`)}
                                />
                            </>
                        )}
                        createEntry={createEntry}
                        removeEntry={removeMachine}
                    />
                </Paper>
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
