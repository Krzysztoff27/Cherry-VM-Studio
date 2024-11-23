import { ActionIcon, Group, ScrollArea, Stack, Table, Text, Title } from "@mantine/core";
import { IconDeviceDesktop, IconDeviceDesktopOff, IconPlayerPlayFilled, IconPlayerStopFilled } from "@tabler/icons-react";
import { useTranslation } from "react-i18next";
import { arrayIntoChunks } from "../../../../utils/misc";
import Loading from "../../../../components/Loading/Loading";
import StateBadge from "../../../../components/StateBadge/StateBadge";
import useFetch from "../../../../hooks/useFetch";

function MachineTitle({ machine, currentState, t }) {
    const icon = currentState.active ?
        <IconDeviceDesktop size={'40'} /> :
        <IconDeviceDesktopOff size={'40'} />;

    const handleBadgeClick = () => { }

    return (
        <Group justify="space-between" pl='lg' pr='lg'>
            <Group align="center">
                {icon}
                <Title order={1} align="center">
                    {t('machine')} {machine.id}
                </Title>
                <Group gap='sm'>
                    <ActionIcon
                        variant='light'
                        size='lg'
                        color='red.9'
                        disabled={currentState.loading || !currentState.active}
                    >
                        <IconPlayerStopFilled size={'28'} />
                    </ActionIcon>
                    <ActionIcon
                        variant='light'
                        size='lg'
                        color='suse-green.9'
                        disabled={currentState.loading || currentState.active}
                    >
                        <IconPlayerPlayFilled size={'28'} />
                    </ActionIcon>
                </Group>
            </Group>
            <StateBadge machineState={currentState} onClick={handleBadgeClick} sizes={{ badge: 'xl', loader: 'md', icon: 15 }} />
        </Group>
    )
}

function NetworkDataTable({ machine, currentState, t }) {
    const keyTdStyle = { textAlign: 'right', fontWeight: 500, width: '25%' };

    const activeConnectionsArray = currentState?.active_connections?.map((address, i) => <Text fz='lg' key={i}>{address}</Text>) || [];
    const activeConnectionsSplit = arrayIntoChunks(activeConnectionsArray, 4);
    const activeConnectionsStacks = activeConnectionsSplit.length ? activeConnectionsSplit.map(
        (elements, i) => <Stack gap='sm' key={i}>{...elements}</Stack>
    ) : 'None';
    
    return (
        <ScrollArea>
            <Table fz='lg' withRowBorders={false} striped>
                <Table.Tbody>
                    <Table.Tr>
                        <Table.Td style={keyTdStyle}>
                            {t('machine.info.type', {ns: 'pages'})}:
                        </Table.Td>
                        <Table.Td tt="capitalize">
                            {`${machine.group} (${machine.group_member_id})`}
                        </Table.Td>
                    </Table.Tr>
                    <Table.Tr>
                        <Table.Td style={keyTdStyle}>
                            {t('machine.info.domain', {ns: 'pages'})}:
                        </Table.Td>
                        <Table.Td><a href={`http://${machine.domain}`}>{machine.domain}</a></Table.Td>
                    </Table.Tr>
                    <Table.Tr>
                        <Table.Td style={keyTdStyle}>
                            {t('machine.info.address', {ns: 'pages'})}:
                        </Table.Td>
                        <Table.Td>
                            <a href={`http://172.16.100.1:${machine.port}`}>
                                172.16.100.1:{machine.port}
                            </a>
                        </Table.Td>
                    </Table.Tr>
                    <Table.Tr>
                        <Table.Td style={{ verticalAlign: 'top', ...keyTdStyle }}>
                            {t('machine.info.active-connections', {ns: 'pages'})}:
                        </Table.Td>
                        <Table.Td><Group align='top'>{activeConnectionsStacks}</Group></Table.Td>
                    </Table.Tr>
                </Table.Tbody>
            </Table>
        </ScrollArea>
    )
}

export default function NetworkDataDisplay({ currentState, uuid, authOptions }) {
    const { t } = useTranslation();
    const { loading, error, data: machine } = useFetch(`/vm/${uuid}/networkdata`, authOptions);

    if (loading) return <Loading />;
    if (error) throw error;

    return (
        <Stack>
            <MachineTitle machine={machine} currentState={currentState} t={t} />
            <NetworkDataTable machine={machine} currentState={currentState} t={t} />
        </Stack>
    )
}
