import { Avatar, Group, Stack, Text } from "@mantine/core";
import React from "react";
import { BusinessCardProps } from "../../../../types/components.types";

const BusinessCard = ({imageSrc, alt, name, comment, link} : BusinessCardProps) : React.JSX.Element => {
    return (
        <Group>
            <Avatar src={imageSrc} alt={alt || name} name={name} size='md' color={name && 'initials'}/>
            <Stack gap='0'>
                <Text>{name}</Text>
                <Text component="a" href={link} c="dimmed">{comment}</Text>
            </Stack>
        </Group>
    );
}

export default BusinessCard;