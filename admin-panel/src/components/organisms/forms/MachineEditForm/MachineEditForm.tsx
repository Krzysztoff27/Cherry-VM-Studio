import { Fieldset, Group, ScrollArea, Stack, Tabs, TagsInput, Textarea, TextInput, Title } from "@mantine/core";
import useNamespaceTranslation from "../../../../hooks/useNamespaceTranslation";
import { IconDeviceDesktopCog, IconDeviceFloppy, IconListDetails, IconUsers } from "@tabler/icons-react";
import { MachineData, MachineDiskForm, MachineState, SimpleState, User } from "../../../../types/api.types";
import EnhancedSlider from "../../../atoms/interactive/EnhancedSlider/EnhancedSlider";
import { useForm } from "@mantine/form";
import MembersTable from "../../tables/MembersTable/MembersTable";
import AddMembersField from "../../../molecules/interactive/AddMembersField/AddMembersField";
import useFetch from "../../../../hooks/useFetch";
import classes from "./MachineEditForm.module.css";
import { usePermissions } from "../../../../contexts/PermissionsContext";
import { isNull, keys } from "lodash";
import MachineDetailsFieldset from "../../../molecules/forms/MachineDetailsFieldset/MachineDetailsFieldset";
import MachineConfigFieldset from "../../../molecules/forms/MachineConfigFieldset/MachineConfigFieldset";
import MachineDisksFieldset from "../../../molecules/forms/MachineDisksFieldset/MachineDisksFieldset";
import { useEffect, useMemo } from "react";

export interface MachineEditFormValues {
    title: string;
    tags: string[];
    description: string;
    config: {
        ram: number;
        vcpu: number;
    };
    disks: MachineDiskForm[];
    os_disk: number;
    assigned_clients: string[];
}

export interface MachineEditFormProps {
    machine: MachineState;
}

const MachineEditForm = ({ machine }: MachineEditFormProps): React.JSX.Element => {
    const { tns } = useNamespaceTranslation("pages", "machine");
    const { data: loggedInUser, loading, error } = useFetch<User>("user");
    const { data: users } = useFetch<Record<string, User>>("users?account_type=client");
    const { canManageMachine } = usePermissions();

    const state: SimpleState = { fetching: machine?.active === undefined, loading: machine?.loading, active: machine?.active };

    const initialValues = useMemo(
        () =>
            ({
                // title: machine.title,
                title: "Unnamed Machine",
                // tags: machine.tags,
                tags: ["Dummy", "Placeholder"],
                // description: machine.description,
                description: "",
                config: {
                    ram: machine.ram_max,
                    vcpu: machine.cpu,
                },
                disks: [],
                os_disk: 0,
                assigned_clients: keys(machine.assigned_clients),
            } as MachineEditFormValues),
        [JSON.stringify(machine)]
    );

    const form = useForm<MachineEditFormValues>({
        initialValues: initialValues,
        validateInputOnChange: true,
        validate: {
            title: (val) =>
                !/^[\w\s.-]+$/.test(val)
                    ? tns("validation.name-invalid-characters")
                    : !/[a-zA-Z]/.test(val[0])
                    ? tns("validation.name-invalid-first")
                    : val.length < 3
                    ? tns("validation.name-too-short")
                    : val.length > 24
                    ? tns("validation.name-too-long")
                    : null,
            tags: (val) =>
                val
                    .map((tag) => {
                        if (!/^[\w\s.-]+$/.test(tag)) return tns("validation.tags-invalid-characters");
                        if (!/[a-zA-Z]/.test(tag[0])) return tns("validation.tags-invalid-first");
                        return null;
                    })
                    .find((e) => e) || null,
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

    const reloadForm = () => {
        form.setInitialValues(initialValues);
        form.reset();
    };

    useEffect(() => {
        reloadForm();
    }, [state.fetching]);

    const addAssignedClients = (newClients: string[]) => {
        form.setFieldValue("assigned_clients", (prev) => [...prev, ...newClients]);
    };

    const removeMember = (uuid: string) => form.setFieldValue("assigned_clients", (prev) => prev.filter((e) => e !== uuid));
    const disabled = !machine || loading || !isNull(error) || !canManageMachine(loggedInUser, machine) || state?.fetching || state?.loading || state.active;
    const assignedUsers = form.values.assigned_clients.map((uuid) => users[uuid]);

    return (
        <Tabs
            defaultValue="details"
            className={classes.tabsContainer}
        >
            <Tabs.List>
                <Tabs.Tab
                    value="details"
                    leftSection={<IconListDetails size={18} />}
                >
                    {tns("details")}
                </Tabs.Tab>
                <Tabs.Tab
                    value="resources"
                    leftSection={<IconDeviceDesktopCog size={18} />}
                >
                    {tns("resources")}
                </Tabs.Tab>
                <Tabs.Tab
                    value="disks"
                    leftSection={<IconDeviceFloppy size={18} />}
                >
                    {tns("disks")}
                </Tabs.Tab>
                <Tabs.Tab
                    value="clients"
                    leftSection={<IconUsers size={18} />}
                >
                    {tns("assigned-clients")}
                </Tabs.Tab>
            </Tabs.List>
            <Tabs.Panel
                value="details"
                className={classes.tabPanel}
            >
                <MachineDetailsFieldset<MachineEditFormValues>
                    form={form}
                    props={{ fieldset: { variant: "default", className: classes.fieldset } }}
                    disabled={disabled}
                    withoutAssignedClients
                />
            </Tabs.Panel>
            <Tabs.Panel
                value="resources"
                className={classes.tabPanel}
            >
                <MachineConfigFieldset<MachineEditFormValues>
                    form={form}
                    props={{ fieldset: { variant: "default", className: classes.fieldset }, scrollArea: { maw: "366px" } }}
                    disabled={disabled}
                    setConfigTemplate={() => {}}
                    configTemplate=""
                />
            </Tabs.Panel>
            <Tabs.Panel
                value="disks"
                className={classes.tabPanel}
            >
                <MachineDisksFieldset<MachineEditFormValues>
                    form={form}
                    props={{ fieldset: { variant: "default", className: classes.fieldset } }}
                    disabled={disabled}
                    osDiskReadonly={true}
                />
            </Tabs.Panel>
            <Tabs.Panel
                value="clients"
                className={classes.tabPanel}
            >
                <Fieldset
                    className={classes.fieldset}
                    disabled={disabled}
                >
                    <Stack
                        pt="xs"
                        gap="42"
                        h="100%"
                    >
                        <AddMembersField
                            alreadyAddedUuids={form.values.assigned_clients}
                            onSubmit={addAssignedClients}
                            multiselectProps={{ classNames: { input: "borderless" } }}
                            buttonProps={{ className: "borderless" }}
                        />
                        <MembersTable
                            usersData={assignedUsers}
                            removeMember={removeMember}
                        />
                    </Stack>
                </Fieldset>
            </Tabs.Panel>
        </Tabs>
    );
};

export default MachineEditForm;
