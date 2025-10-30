import { ActionIcon, Button, Flex, Group, NumberInput, Paper, Select, Stack, Text, TextInput } from "@mantine/core";
import useNamespaceTranslation from "../../../../hooks/useNamespaceTranslation";
import ListInput from "../../../atoms/interactive/ListInput/ListInput";
import { IconCircle, IconCircleCheckFilled } from "@tabler/icons-react";
import { useRef } from "react";
import classes from "./MachineDisksForm.module.css";
import cs from "classnames";

interface MachineDisksFormProps {
    form: any;
    classes: Record<string, string>;
    onClose: () => void;
    onSubmit: () => void;
}

const MachineDisksForm = ({ form, classes: inheritedClasses, onClose, onSubmit }: MachineDisksFormProps): React.JSX.Element => {
    const newDiskNameRef = useRef(null);

    const { t, tns } = useNamespaceTranslation("modals", "create-machine");

    const validateDisksForm = () => {
        // ! fix disk validation
        form.validateField("disks");
        return form.isValid("disks");
    };

    const createNewDisk = () => {
        form.setFieldValue("disks", (prev) => [...prev, { name: "", size: 0, unit: "MiB", type: "type1" }]);
    };

    const removeDisk = (index: number) => {
        form.setFieldValue("disks", (prev) => prev.filter((_, i) => i !== index));
        form.setFieldValue("os_disk", (prev) => (prev >= index ? prev - 1 : prev));
    };

    const canRemoveDisk = (index: number) => form.values.disks.length <= 1 || form.values.os_disk === index;

    return (
        <Stack>
            <Text className={classes.description}>{tns("description-disks")}</Text>
            <Paper className={classes.formBorder}>
                <ListInput
                    values={form.values.disks}
                    headerRow={() => (
                        <Group className={classes.headerGroup}>
                            <Flex
                                w="36"
                                className={cs(classes.headerText, classes.center)}
                            >
                                #
                            </Flex>
                            <Flex
                                w="36"
                                className={cs(classes.headerText, classes.center)}
                            >
                                OS
                            </Flex>
                            <Flex
                                w="180"
                                className={cs(classes.headerText, classes.left)}
                            >
                                {tns("drive-name")}
                            </Flex>
                            <Flex
                                w="164"
                                className={cs(classes.headerText, classes.left)}
                            >
                                {tns("drive-size")}
                            </Flex>
                            <Flex
                                w="80"
                                className={cs(classes.headerText, classes.left)}
                            >
                                {tns("drive-type")}
                            </Flex>
                        </Group>
                    )}
                    row={(_, i) => (
                        <>
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
                                    decimalScale={3}
                                    min={1}
                                    max={1024}
                                    hideControls
                                    classNames={{ input: cs("borderless", classes.sizeInputLeft) }}
                                    key={form.key(`disks.${i}.size`)}
                                    {...form.getInputProps(`disks.${i}.size`)}
                                />
                                <Select
                                    w={80}
                                    data={["MiB", "GiB"]}
                                    allowDeselect={false}
                                    classNames={{ input: cs("borderless", classes.sizeInputLeft) }}
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
                        </>
                    )}
                    createEntry={createNewDisk}
                    removeEntry={removeDisk}
                    canRemoveEntry={canRemoveDisk}
                    h="300px"
                />
            </Paper>

            <Group
                justify="center"
                mt="lg"
            >
                <Button
                    className={inheritedClasses.closeButton}
                    onClick={onClose}
                >
                    {t("previous")}
                </Button>
                <Button
                    variant="white"
                    className={inheritedClasses.nextButton}
                    onClick={() => validateDisksForm() && onSubmit()}
                >
                    {t("create")}
                </Button>
            </Group>
        </Stack>
    );
};

export default MachineDisksForm;
