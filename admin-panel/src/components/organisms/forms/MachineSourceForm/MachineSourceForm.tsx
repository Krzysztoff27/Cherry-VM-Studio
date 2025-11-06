import { Button, Group, Radio, Select, Stack } from "@mantine/core";
import useNamespaceTranslation from "../../../../hooks/useNamespaceTranslation";
import { UseFormReturnType } from "@mantine/form";
import { CreateMachineFormValues } from "../../../../modals/machines/CreateMachineModal/CreateMachineModal";
import useFetch from "../../../../hooks/useFetch";
import { entries, uniqueId } from "lodash";
import { IsoRecord } from "../../../../types/api.types";

interface MachineSourceFormProps {
    form: UseFormReturnType<CreateMachineFormValues>;
    classes: Record<string, string>;
    onClose: () => void;
    onSubmit: () => void;
}

const MachineSourceForm = ({ form, classes, onClose, onSubmit }: MachineSourceFormProps): React.JSX.Element => {
    const { data: isoFiles } = useFetch("/iso");
    const { t, tns } = useNamespaceTranslation("modals", "create-machine");

    const validateSourceForm = () => {
        form.validateField("source_uuid");
        return form.isValid("source_uuid");
    };

    const isoSelectData = entries(isoFiles).map(([uuid, isoRecord]: [string, IsoRecord]) => ({ value: uuid, label: isoRecord.name }));
    const snapshotSelectData = [];

    return (
        <Stack>
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
                    data={form.values.source_type === "iso" ? isoSelectData : snapshotSelectData}
                    key={form.key("source_uuid")}
                    {...form.getInputProps("source_uuid")}
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
                        onClick={() => validateSourceForm() && onSubmit()}
                    >
                        {t("next")}
                    </Button>
                </Group>
            </Stack>
        </Stack>
    );
};

export default MachineSourceForm;
