import { Avatar, Group, Stack, Text } from "@mantine/core";
import React from "react";
import { BusinessCardProps } from "../../../../types/components.types";

const BusinessCard = ({ imageSrc, alt, name, comment, link, withAvatar = true, size = "md", gap = "md" }: BusinessCardProps): React.JSX.Element => {
    return (
        <Group
            wrap="nowrap"
            gap={gap}
        >
            {withAvatar && (
                <Avatar
                    src={imageSrc}
                    alt={alt || name}
                    name={name}
                    size={size}
                    color={name && "initials"}
                />
            )}
            <Stack gap="0">
                <Text size={size}>{name}</Text>
                <Text
                    {...(link
                        ? {
                              component: "a",
                              href: link,
                          }
                        : {})}
                    c="dimmed"
                    size={size}
                >
                    {comment}
                </Text>
            </Stack>
        </Group>
    );
};

export default BusinessCard;
