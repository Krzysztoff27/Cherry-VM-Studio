import { Avatar, Button, Fieldset, Group, Modal, NumberInput, SimpleGrid, Stack, Text, TextInput, Title } from "@mantine/core";
import { IsoFileImportModalProps } from "../../../types/components.types";
import { useForm } from "@mantine/form";
import useNamespaceTranslation from "../../../hooks/useNamespaceTranslation";
import { IconDisc, IconTemplate } from "@tabler/icons-react";
import { values } from "lodash";
import useFetch from "../../../hooks/useFetch";
import EnhancedSlider from "../../../components/atoms/interactive/EnhancedSlider/EnhancedSlider";
import classes from "./CreateTemplateModal.module.css";

export interface CreateTemplateModalFormValues {
    name: string;
    ram: number;
    vcpu: number;
}

const CreateTemplateModal = ({ opened, onClose, onSubmit, ...props }: IsoFileImportModalProps): React.JSX.Element => {
    const { tns, t } = useNamespaceTranslation("modals", "create-template");
    const { data: templates } = useFetch("/machine/template/all");

    const takenNames = values(templates).map((template) => template.name);

    const maxRam = 4096;
    const maxVcpu = 8;

    const form = useForm<CreateTemplateModalFormValues>({
        initialValues: {
            name: "",
            ram: 1024,
            vcpu: 1,
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
                    : takenNames.includes(val)
                    ? tns("validation.name-duplicate")
                    : null,
        },
    });

    const closeModal = () => {
        form.reset();
        onClose();
    };

    const submitForm = form.onSubmit(async (values) => {
        // POST

        onSubmit?.();
        closeModal();
    });

    return (
        <Modal
            opened={opened}
            onClose={closeModal}
            title={tns("title")}
            size="480"
        >
            <form onSubmit={submitForm}>
                <Stack>
                    <Stack className={classes.inputStack}>
                        <TextInput
                            description={tns("name-note")}
                            placeholder={tns("name")}
                            w={336}
                            key={form.key("name")}
                            maxLength={24}
                            minLength={3}
                            classNames={{ input: "borderless" }}
                            {...form.getInputProps("name")}
                        />
                        <Group>
                            <NumberInput
                                label={tns("ram")}
                                description={tns("ram-description", { count: maxRam })}
                                rightSection={tns("ram-unit", { count: form.values.ram })}
                                w="160px"
                                rightSectionWidth="40px"
                                classNames={{ input: "borderless", section: classes.rightSections }}
                                max={maxRam}
                                min={0}
                                clampBehavior="strict"
                                key={form.key("ram")}
                                {...form.getInputProps("ram")}
                            />
                            <NumberInput
                                label={tns("vcpu")}
                                description={tns("vcpu-description", { count: maxVcpu })}
                                rightSection={tns("vcpu-unit", { count: form.values.vcpu })}
                                w="160px"
                                rightSectionWidth="60px"
                                classNames={{ input: "borderless", section: classes.rightSections }}
                                max={maxVcpu}
                                min={0}
                                clampBehavior="strict"
                                key={form.key("vcpu")}
                                {...form.getInputProps("vcpu")}
                            />
                        </Group>
                    </Stack>

                    <SimpleGrid
                        cols={2}
                        mt="sm"
                    >
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
};

export default CreateTemplateModal;
