import { Avatar, Box, Card, Container, Group, List, SimpleGrid, Stack, Text, Title } from "@mantine/core";
import Snowfall from "react-snowfall";
import classes from "./Credits.module.css";
import { contributors } from "../../config/project.config";
import { safeObjectValues } from "../../utils/misc";

const getImageElement = src => {
    const img = new Image();
    img.src = src;
    return img;
};

const images = [getImageElement("/icons/Cherry Admin Panel.webp"), getImageElement("/icons/Tux.webp"), getImageElement("/icons/Geeko Button Green.webp")];

export default function Credits() {
    return (
        <SimpleGrid
            cols={2}
            className={classes.grid}
            w="100%"
            p={64}
            pt={72}
            spacing={64}
        >
            {contributors.map((contributor, i) => (
                <Card
                    mih={400}
                    key={i}
                >
                    <Stack gap="lg">
                        <Group
                            gap="lg"
                            p="sm"
                        >
                            <Avatar
                                src={contributor.avatar}
                                name={contributor.name}
                                color="initials"
                                size="xl"
                                bg="dark.8"
                            />
                            <Title
                                order={1}
                                fw={400}
                            >
                                {contributor.name}
                            </Title>
                        </Group>
                        <Group
                            align="start"
                            pl="lg"
                            gap="xl"
                        >
                            <Stack
                                gap="xs"
                                flex="1"
                            >
                                <Title
                                    fw={500}
                                    order={4}
                                >
                                    Contributions:
                                </Title>

                                <List>
                                    {contributor.contributions.map((item, i) => (
                                        <List.Item key={i}>{item}</List.Item>
                                    ))}
                                </List>
                            </Stack>
                            <Stack
                                gap="xs"
                                flex="1"
                            >
                                <Title
                                    fw={500}
                                    order={4}
                                >
                                    Socials:
                                </Title>

                                <Stack>
                                    {contributor?.socials?.map?.(({ name, url, icon: Icon }, i) => (
                                        <a
                                            href={url}
                                            style={{
                                                display: "flex",
                                                gap: 6,
                                            }}
                                        >
                                            <Icon></Icon>
                                            {name}
                                        </a>
                                    ))}
                                </Stack>
                            </Stack>
                        </Group>
                    </Stack>
                </Card>
            ))}
        </SimpleGrid>
    );
}
