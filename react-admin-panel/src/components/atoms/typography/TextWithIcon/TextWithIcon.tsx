import { Group, Text } from '@mantine/core';
import React from 'react'
import { TextWithIconProps } from '../../../../types/atoms.types';

const TextWithIcon = ({ Icon, text } : TextWithIconProps): React.JSX.Element => (
    <Group justify='start' align='center' gap='4'>
        <Icon size={18} />
        <Text>{text}</Text>
    </Group>
)

export default TextWithIcon;
