import { Button, Divider, Group, Select, Stack, Text } from "@mantine/core";
import { isNull } from "lodash";
import React from "react";
import useNamespaceTranslation from "../../../../hooks/useNamespaceTranslation";
import EnhancedSlider from "../../../atoms/interactive/EnhancedSlider/EnhancedSlider";
import { UseFormReturnType } from "@mantine/form";
import { CreateMachineFormValues } from "../../../../modals/machines/CreateMachineModal/CreateMachineModal";

interface MachineConfigFormProps {
    form: UseFormReturnType<CreateMachineFormValues>;
    classes: Record<string, string>;
    configTemplate: string;
    setConfigTemplate: (callback: ((prev: string) => string) | string) => void;
    onClose: () => void;
    onSubmit: () => void;
}

const MachineConfigForm = ({ form, configTemplate, setConfigTemplate, classes, onClose, onSubmit }: MachineConfigFormProps): React.JSX.Element => {
    const { t, tns } = useNamespaceTranslation("modals", "create-machine");

    const onTemplateChange = (value: string | null) => {
        setConfigTemplate(value);

        // todo replace with actual template values
        form.setFieldValue("config", { ram: 1024, vcpu: 1 });
    };

    return (
        <Stack style={{ overflow: "hidden" }}>
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
                w="100%"
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
                w="100%"
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
                    onClick={onClose}
                >
                    {t("previous")}
                </Button>
                <Button
                    variant="white"
                    className={classes.nextButton}
                    onClick={onSubmit}
                >
                    {t("next")}
                </Button>
            </Group>
        </Stack>
    );
};

export default MachineConfigForm;
