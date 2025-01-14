import { Group, SegmentedControl, Stack } from '@mantine/core';
import { AreaChart } from '@mantine/charts';
import React, { useEffect, useState } from 'react';
import { getCurrentTime } from '../../../../utils/misc';
import { useTranslation } from 'react-i18next';
import { MachineState } from '../../../../types/api.types';
import { MachineStateChartData } from '../../../../types/components.types';

const getLabel = (resource: string, t: Function) => t ? t('machine.graph.resource-used', { resource: resource, ns: 'pages' }) : null;

const getChartProps = (currentState: MachineState | undefined, t: Function) => currentState ? ({
    CPU: {
        yAxisProps: { domain: [0, 100], width: 80 },
        series: [{ name: 'cpu', color: 'indigo.6', label: getLabel('CPU', t) }],
        unit: '%'
    },
    RAM: {
        yAxisProps: currentState.ram_max ? { domain: [0, currentState.ram_max], tickCount: 12, width: 80 } : undefined,
        series: [{ name: 'ram_used', color: 'teal.6', label: getLabel('RAM', t) }],
        unit: ' MB'
    }
}) : {};

const timePeriods = [
    { label: '10s', value: '10' },
    { label: '30s', value: '30' },
    { label: '1min', value: '60' },
    { label: '5min', value: '300' },
]

const maxKeepTime = parseInt(timePeriods.at(-1).value)

export default function MachineStateChart({ currentState }) {
    const { t } = useTranslation();
    const [chosenChart, setChosenChart] = useState<string>('CPU');
    const [timePeriod, setTimePeriod] = useState<string>('30')
    const [chartData, setChartData] = useState<Array<MachineStateChartData | object>>(new Array(maxKeepTime).fill({}));
    
    useEffect(() => {
        const time = getCurrentTime();
        const newChartData: MachineStateChartData = (({ cpu, ram_used, ram_max }) => ({ cpu, ram_used, ram_max }))(currentState);

        setChartData(pastData => [...pastData, { time: time, ...newChartData }].slice(-maxKeepTime))
    }, [currentState])

    return (
        <Stack justify='flex-end' align='flex-start' gap='xl' >
            <Group justify='space-between' w='100%'>
                <SegmentedControl
                    size="md"
                    data={Object.keys(getChartProps(currentState, t))}
                    onChange={setChosenChart}
                />
                <SegmentedControl
                    size="md"
                    data={timePeriods}
                    onChange={setTimePeriod}
                    withItemsBorders={false}
                    defaultValue={'30'}
                />
            </Group>
            <AreaChart
                flex='1'
                data={chartData.slice(-parseInt(timePeriod) - 1)}
                dataKey='time'
                tickLine="x"
                curveType="linear"
                {...getChartProps(currentState, t)?.[chosenChart]}
                xAxisProps={{ minTickGap: 50 }}
            />
        </Stack>
    )
}
