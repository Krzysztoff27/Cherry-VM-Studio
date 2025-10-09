import { ActionIcon, Avatar, Button, Checkbox, FileButton, Group, Modal, Progress, Select, SimpleGrid, Stack, Text, TextInput } from "@mantine/core";
import { IsoFileImportModalProps } from "../../../types/components.types";
import { useForm } from "@mantine/form";
import { useEffect, useRef, useState } from "react";
import useNamespaceTranslation from "../../../hooks/useNamespaceTranslation";
import useMantineNotifications from "../../../hooks/useMantineNotifications";
import { IconDisc, IconFile, IconUpload, IconX } from "@tabler/icons-react";
import { isNull } from "lodash";
import classes from "./IsoFileImportModal.module.css";
import useFileUpload from "../../../hooks/useFileUpload";

type ImportTypes = "file" | "url";

const IsoFileImportModal = ({ opened, onClose, onSubmit, ...props }: IsoFileImportModalProps): React.JSX.Element => {
    const [importType, setImportType] = useState<ImportTypes>("file");
    const { uploadFile, progress, status } = useFileUpload();
    const resetRef = useRef<() => void>(null);

    const { tns, t } = useNamespaceTranslation("modals", "import-iso");
    const { sendNotification } = useMantineNotifications();

    const form = useForm({
        mode: "uncontrolled",
        initialValues: {
            name: "",
            file: null,
            url: "",
        },
    });

    const closeModal = () => {
        form.reset();
        onClose();
    };

    const submitForm = form.onSubmit(async (values) => {
        if (importType === "file") {
            uploadFile(values.file);
            console.log(progress);
        } else if (importType == "url") {
        }

        closeModal();
        onSubmit?.();
    });

    const clearFile = () => {
        form.setFieldValue("file", null);
        resetRef.current?.();
    };

    const currentValues = form.getValues();

    return (
        <Modal
            opened={opened}
            onClose={closeModal}
            title={tns("title")}
            size="480"
        >
            <form onSubmit={submitForm}>
                <Stack>
                    <Group className={classes.description}>
                        <Avatar color="cherry">
                            <IconDisc />
                        </Avatar>
                        <Text>{tns("description")}</Text>
                    </Group>
                    <Stack className={classes.inputStack}>
                        <Select
                            description={tns("import-type-note")}
                            value={importType}
                            onChange={(val) => setImportType(val as ImportTypes)}
                            data={[
                                { value: "file", label: "From File" },
                                { value: "url", label: "From URL" },
                            ]}
                            w={300}
                            allowDeselect={false}
                        />
                        <TextInput
                            description={tns("name-note")}
                            placeholder={tns("name")}
                            w={300}
                            key={form.key("name")}
                            {...form.getInputProps("name")}
                        />
                        {importType === "file" ? (
                            <Stack gap="sm">
                                <Group
                                    align="end"
                                    gap="0"
                                >
                                    <FileButton
                                        resetRef={resetRef}
                                        key={form.key("file")}
                                        onChange={(file) => form.setFieldValue("file", file)}
                                    >
                                        {(props) => (
                                            <Button
                                                {...props}
                                                w={currentValues.file ? 264 : 150}
                                                variant="default"
                                                className={classes.fileButton}
                                                aria-selected={!isNull(currentValues.file)}
                                                leftSection={isNull(currentValues.file) ? <IconUpload size={18} /> : <IconFile size={18} />}
                                            >
                                                {currentValues.file?.name || "Upload file"}
                                            </Button>
                                        )}
                                    </FileButton>
                                    {currentValues.file && (
                                        <ActionIcon
                                            variant="default"
                                            onClick={clearFile}
                                            className={classes.resetFileButton}
                                        >
                                            <IconX />
                                        </ActionIcon>
                                    )}
                                </Group>
                            </Stack>
                        ) : (
                            <>
                                <TextInput
                                    description={tns("url-note")}
                                    placeholder={tns("url")}
                                    w={300}
                                    key={form.key("url")}
                                    {...form.getInputProps("url")}
                                />
                                <Checkbox
                                    className={classes.saveLocallyCheckbox}
                                    radius="sm"
                                    label={tns("save-locally")}
                                />
                            </>
                        )}
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
};

export default IsoFileImportModal;
