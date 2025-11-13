import { Fieldset, Group, ScrollArea, Stack, Tabs, TagsInput, Textarea, TextInput } from "@mantine/core";
import useNamespaceTranslation from "../../../../hooks/useNamespaceTranslation";
import { IconDeviceDesktopCog, IconDeviceFloppy, IconListDetails, IconUsers } from "@tabler/icons-react";
import { MachineData, MachineState, SimpleState, User } from "../../../../types/api.types";
import EnhancedSlider from "../../../atoms/interactive/EnhancedSlider/EnhancedSlider";
import { useForm } from "@mantine/form";
import MembersTable from "../../tables/MembersTable/MembersTable";
import AddMembersField from "../../../molecules/interactive/AddMembersField/AddMembersField";
import useFetch from "../../../../hooks/useFetch";
import classes from "./MachineEditForm.module.css";
import { usePermissions } from "../../../../contexts/PermissionsContext";
import { isNull } from "lodash";

export interface MachineEditFormProps {
    machine: MachineState;
}

const MachineEditForm = ({ machine }: MachineEditFormProps): React.JSX.Element => {
    const { tns } = useNamespaceTranslation("pages", "machine");
    const { data: loggedInUser, loading, error } = useFetch<User>("user");
    const { data: users } = useFetch<Record<string, User>>("users?account_type=client");
    const { canManageMachine } = usePermissions();

    const state: SimpleState = { fetching: machine?.active === undefined, loading: machine?.loading, active: machine?.active };

    const form = useForm({
        initialValues: {
            title: "Dummy title",
            tags: ["Dummy", "Placeholder", "Server"],
            description: "Lorem ipsum sol doles or whatever",
            config: {
                ram: 1024,
                vcpu: 3,
            },
            disks: [
                { name: "sda", size_bytes: 12540558, type: "raw", os_disk: false },
                { name: "sdb", size_bytes: 1240558, type: "raw", os_disk: true },
            ],
            assigned_clients: [],
        },
    });

    const disabled = !machine || loading || !isNull(error) || !canManageMachine(loggedInUser, machine) || state?.fetching || state?.loading || state.active;

    const refresh = () => form.setValues(machine);

    const addAssignedClients = (newClients: string[]) => {
        form.setFieldValue("assigned_clients", (prev) => [...prev, ...newClients]);
    };

    const removeMember = (uuid: string) => {
        console.log(uuid);
        form.setFieldValue("assigned_clients", (prev) => prev.filter((e) => e !== uuid));
    };

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
                <Fieldset
                    className={classes.fieldset}
                    disabled={disabled}
                >
                    <ScrollArea>
                        <Stack pt="md">
                            <Group align="top">
                                <TextInput
                                    placeholder={tns("machine-name-placeholder")}
                                    description={tns("machine-name")}
                                    w={400}
                                    classNames={{ input: "borderless" }}
                                    key={form.key("title")}
                                    {...form.getInputProps("title")}
                                />
                                <TextInput
                                    description={tns("machine-group-no")}
                                    classNames={{ input: "borderless" }}
                                    w={50}
                                    value="1"
                                    readOnly
                                />
                            </Group>
                            <TagsInput
                                placeholder={form.values.tags.length ? "" : tns("machine-tags-placeholder")}
                                description={tns("machine-tags")}
                                w={466}
                                classNames={{ input: "borderless" }}
                                maxLength={12}
                                maxTags={3}
                                key={form.key("tags")}
                                {...form.getInputProps("tags")}
                            />
                            <Textarea
                                placeholder={tns("machine-description-placeholder")}
                                description={tns("machine-description")}
                                w={466}
                                classNames={{ input: "borderless" }}
                                key={form.key("description")}
                                {...form.getInputProps("description")}
                            />
                        </Stack>
                    </ScrollArea>
                </Fieldset>
            </Tabs.Panel>
            <Tabs.Panel
                value="resources"
                className={classes.tabPanel}
            >
                <Fieldset
                    className={classes.fieldset}
                    disabled={disabled}
                >
                    <Stack pt="md">
                        <EnhancedSlider
                            heading={tns("ram")}
                            label={(val) => tns("ram-unit", { count: val })}
                            w="100%"
                            size="xs"
                            thumbSize="10"
                            styles={{ thumb: { border: "none" } }}
                            max={4096}
                            step={128}
                            key={form.key("config.ram")}
                            {...form.getInputProps("config.ram")}
                        />

                        <EnhancedSlider
                            heading={tns("vcpu")}
                            label={(val) => tns("vcpu-unit", { count: val })}
                            w="100%"
                            size="xs"
                            thumbSize="10"
                            styles={{ thumb: { border: "none" } }}
                            min={0}
                            max={8}
                            key={form.key("config.vcpu")}
                            {...form.getInputProps("config.vcpu")}
                        />
                    </Stack>
                </Fieldset>
            </Tabs.Panel>
            <Tabs.Panel
                value="disks"
                className={classes.tabPanel}
            ></Tabs.Panel>
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
                            alreadyAddedUsers={form.values.assigned_clients}
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
