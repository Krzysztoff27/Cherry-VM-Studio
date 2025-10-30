import { isNotEmpty, useForm } from "@mantine/form";
import useNamespaceTranslation from "../../../hooks/useNamespaceTranslation";
import { Modal, useModalsStack } from "@mantine/core";
import { useEffect, useState } from "react";
import classes from "./CreateMachineModal.module.css";
import MachineDetailsForm from "../../../components/organisms/forms/MachineDetailsForm/MachineDetailsForm";
import MachineSourceForm from "../../../components/organisms/forms/MachineSourceForm/MachineSourceForm";
import MachineConfigForm from "../../../components/organisms/forms/MachineConfigForm/MachineConfigForm";
import MachineDisksForm from "../../../components/organisms/forms/MachineDisksForm/MachineDisksForm";

const CreateMachineModal = ({ opened, onClose, onSubmit }): React.JSX.Element => {
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
                <MachineDetailsForm
                    form={form}
                    classes={classes}
                    onClose={onClose}
                    onSubmit={() => {
                        stack.open("source-page");
                        stack.close("details-page");
                    }}
                />
            </Modal>
            <Modal
                {...stack.register("source-page")}
                title={tns("title")}
                onClose={onClose}
            >
                <MachineSourceForm
                    form={form}
                    classes={classes}
                    onClose={() => {
                        resetSourcePage();
                        stack.open("details-page");
                        stack.close("source-page");
                    }}
                    onSubmit={() => {
                        stack.open("config-page");
                        stack.close("source-page");
                    }}
                />
            </Modal>
            <Modal
                {...stack.register("config-page")}
                title={tns("title")}
                onClose={onClose}
            >
                <MachineConfigForm
                    form={form}
                    classes={classes}
                    configTemplate={configTemplate}
                    setConfigTemplate={setConfigTemplate}
                    onClose={() => {
                        resetConfigPage();
                        stack.open("source-page");
                        stack.close("config-page");
                    }}
                    onSubmit={() => {
                        stack.open("disks-page");
                        stack.close("config-page");
                    }}
                />
            </Modal>
            <Modal
                {...stack.register("disks-page")}
                title={tns("title-disks")}
                styles={{ title: { fontWeight: 500, fontSize: 20 } }}
                onClose={onClose}
                size="680px"
            >
                <MachineDisksForm
                    form={form}
                    classes={classes}
                    onClose={() => {
                        resetDisksPage();
                        stack.open("config-page");
                        stack.close("disks-page");
                    }}
                    onSubmit={() => {
                        stack.close("disks-page");
                        submit();
                    }}
                />
            </Modal>
        </Modal.Stack>
    );
};

export default CreateMachineModal;
