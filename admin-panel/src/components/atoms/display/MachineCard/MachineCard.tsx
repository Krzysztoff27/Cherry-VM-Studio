import { ActionIcon, Box, Card, CardProps, Grid, Group, Stack, Text } from "@mantine/core";
import classes from "./MachineCard.module.css";
import cs from "classnames";
import BadgeGroup from "../BadgeGroup/BadgeGroup";
import useNamespaceTranslation from "../../../../hooks/useNamespaceTranslation";
import AccountAvatarGroup from "../AccountAvatarGroup/AccountAvatarGroup";
import { IconPlayerPlayFilled, IconPlayerStopFilled } from "@tabler/icons-react";
import { MachineState, User } from "../../../../types/api.types";
import { values } from "lodash";
import { getFullUserName } from "../../../../utils/users";
import BusinessCard from "../BusinessCard/BusinessCard";
import useApi from "../../../../hooks/useApi";
import useFetch from "../../../../hooks/useFetch";
import { usePermissions } from "../../../../contexts/PermissionsContext";
import ConnectToMachineSplitButton from "../../interactive/ConnectToMachineSplitButton/ConnectToMachineSplitButton";
import MachineActivityIndicator from "../../feedback/MachineActivityIndicator/MachineActivityIndicator";
import { useThrottledCallback } from "@mantine/hooks";

interface MachineCardProps extends CardProps {
    machine: MachineState;
}

const MachineCard = ({ machine, className, ...props }: MachineCardProps): React.JSX.Element => {
    const { t, tns } = useNamespaceTranslation("pages", "machines");
    const { data: user } = useFetch("user");
    const { canManageMachine, canConnectToMachine } = usePermissions();
    const { sendRequest } = useApi();

    const state = { fetching: machine?.active === undefined, loading: machine.loading, active: machine.active };
    const stateColor = `var(--mantine-color-${state.fetching ? "orange-5" : state.loading ? "yellow-5" : state.active ? "suse-green-5" : "cherry-5"})`;

    const canConnect = canConnectToMachine(user, machine);

    const toggleState = useThrottledCallback(() => {
        if (state.active) sendRequest("POST", `/machine/stop/${machine.uuid}`);
        else sendRequest("POST", `/machine/start/${machine.uuid}`);
    }, 2000);

    return (
        <Card className={cs(classes.card, className)}>
            <Card.Section className={classes.topSection}>
                <Group className={classes.topSectionGroup}>
                    <MachineActivityIndicator state={state} />
                    <Stack className={classes.titleStack}>
                        <Text
                            tt="capitalize"
                            size="md"
                            fw="600"
                            className={classes.title}
                        >
                            {machine?.title ?? "Unnamed Machine"}
                        </Text>
                        <Text
                            size="xs"
                            c={stateColor}
                            pl="2"
                        >
                            {t(state.fetching ? "fetching" : state.loading ? "loading" : state.active ? "online" : "offline")}
                        </Text>
                    </Stack>
                    <BadgeGroup
                        className={classes.tagsContainer}
                        badgeGroupProps={{ className: classes.badgeGroup }}
                        size="md"
                        items={machine?.tags?.sort?.((a, b) => b.length - a.length) ?? []}
                    />
                </Group>
            </Card.Section>
            <Stack
                pt="lg"
                gap="lg"
                pl="4"
                pr="4"
            >
                <Stack gap="6">
                    <Text
                        size="sm"
                        fw="500"
                    >
                        {tns("table.headers.description")}
                    </Text>
                    <Text
                        c="dimmed"
                        size="sm"
                    >
                        {machine.description.trim() || "-"}
                    </Text>
                </Stack>

                {/* <Group w="100%">
                    <Text
                        size="sm"
                        fw="500"
                    >
                        {tns("table.headers.ram")}
                    </Text>
                    <ProgressWithPercentage
                        flex="1"
                        size="xs"
                        value={(machine.ram_used / machine.ram_max) * 100}
                    />
                </Group>
                <Group w="100%">
                    <Text
                        size="sm"
                        fw="500"
                    >
                        {tns("table.headers.cpu")}
                    </Text>
                    <ProgressWithPercentage
                        flex="1"
                        size="xs"
                        value={machine.cpu}
                    />
                </Group> */}
                <Grid>
                    <Grid.Col span={8}>
                        <Stack gap="6">
                            <Text
                                size="sm"
                                fw="500"
                            >
                                {tns("table.headers.owner")}
                            </Text>
                            <BusinessCard
                                name={getFullUserName(machine.owner)}
                                comment={`@${machine.owner.username}`}
                                size="sm"
                                gap="xs"
                            />
                        </Stack>
                    </Grid.Col>
                    <Grid.Col span={4}>
                        <Stack gap="6">
                            <Text
                                size="sm"
                                fw="500"
                            >
                                {tns("table.headers.assignees")}
                            </Text>
                            <AccountAvatarGroup
                                users={values(machine.assigned_clients) as User[]}
                                max={2}
                                avatarProps={{ size: "md" }}
                                dropdownLabel={
                                    <Text
                                        fw="500"
                                        size="sm"
                                    >
                                        {tns("table.headers.assigned-clients")}
                                    </Text>
                                }
                            />
                        </Stack>
                    </Grid.Col>
                </Grid>
            </Stack>
            <Group
                mt="auto"
                justify="space-between"
                wrap="nowrap"
            >
                <Box w="36" />
                <ConnectToMachineSplitButton
                    machine={machine}
                    state={state}
                />
                <ActionIcon
                    variant="light"
                    size="36"
                    color={state.active ? "red.9" : "suse-green.6"}
                    disabled={!canConnect || state.fetching || state.loading}
                    onClick={toggleState}
                >
                    {state.fetching || state.loading || !state.active ? <IconPlayerPlayFilled size={22} /> : <IconPlayerStopFilled size={22} />}
                </ActionIcon>
            </Group>
        </Card>
    );
};

export default MachineCard;
