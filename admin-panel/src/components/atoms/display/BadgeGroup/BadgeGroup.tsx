import { Badge, Group, ScrollArea, Stack, Text, Title } from "@mantine/core";
import classes from "./BadgeGroup.module.css";
import { ReactNode } from "react";

export interface BadgeGroupProps {
    items: ReactNode[];
    label?: ReactNode;
    emptyMessage?: ReactNode;
}

const BadgeGroup = ({ items, label, emptyMessage = "" }: BadgeGroupProps) => {
    return (
        <Stack className={classes.container}>
            {label && (
                <Title
                    order={5}
                    className={classes.label}
                >
                    {label}
                </Title>
            )}

            <ScrollArea
                type="always"
                scrollbarSize="0.65rem"
                className={classes.scrollArea}
                scrollbars="y"
            >
                <Group
                    align="start"
                    className={classes.badgeGroup}
                >
                    {items.length ? (
                        items.map((item: string, index: number) => (
                            <Badge
                                key={index}
                                variant="light"
                                color="gray"
                                size="lg"
                                fw={500}
                                className={classes.badge}
                            >
                                {item}
                            </Badge>
                        ))
                    ) : (
                        <Text
                            fz="sm"
                            className={classes.emptyMessage}
                        >
                            {emptyMessage}
                        </Text>
                    )}
                </Group>
            </ScrollArea>
        </Stack>
    );
};

export default BadgeGroup;
