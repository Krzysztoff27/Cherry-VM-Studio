import { Avatar, Button, Card, Group, Image, List, rem, ScrollArea, SimpleGrid, Stack, Text, Title } from "@mantine/core";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import urlConfig from "../../../../config/url.config";
import classes from "./AdminHomePage.module.css";
import useNamespaceTranslation from "../../../../hooks/useNamespaceTranslation";
import useFetch from "../../../../hooks/useFetch";
import { User } from "../../../../types/api.types";
import { getFullUserName } from "../../../../utils/users";
import { isNull } from "lodash";
import HomeHeader from "../../../../components/organisms/layout/HomeHeader/HomeHeader";

const panels = [
    {
        name: "guacamole",
        link: urlConfig.guacamole,
        color: "#578c34",
        icon: "/icons/Apache Guacamole.webp",
    },
    {
        name: "traefik",
        link: urlConfig.traefik,
        color: "#24A0C1",
        icon: "/icons/Traefik Proxy.webp",
    },
];

function AdminHomePage() {
    const { data: user, loading, error } = useFetch<User>("user");
    const { t, tns } = useNamespaceTranslation("pages", "admin-home");

    const cards = panels.map((panel, i) => (
        <Card
            key={i}
            shadow="sm"
            className={classes.card}
            withBorder
        >
            <Stack className={classes.cardStack1}>
                <Stack className={classes.cardStack2}>
                    <Group className={classes.cardGroup}>
                        <Avatar
                            src={panel.icon}
                            title={tns(`cards.${panel.name}.title`)}
                            alt={tns(`cards.${panel.name}.logo-alt`)}
                        />
                        <Text className={classes.panelTitle}>{tns(`cards.${panel.name}.title`)}</Text>
                    </Group>
                    <Text
                        size="sm"
                        c="dimmed"
                    >
                        {tns(`cards.${panel.name}.description`)}
                    </Text>
                </Stack>
                <Button
                    component="a"
                    href={panel.link}
                    color={panel.color}
                    radius="md"
                    fullWidth
                >
                    {t("log-in")}
                </Button>
            </Stack>
        </Card>
    ));

    return (
        <>
            <ScrollArea w="100%">
                <Stack className={classes.container}>
                    <Stack align="center">
                        <Title>{tns("title", { fullname: isNull(user) ? "" : getFullUserName(user) })}</Title>
                        <Text className={classes.description}>{tns("description1")}</Text>
                    </Stack>
                    <Card
                        className={`${classes.card} ${classes.main}`}
                        shadow="sm"
                        withBorder
                    >
                        <Group>
                            <Image
                                src="/icons/Cherry VM Studio Logo Small.webp"
                                fit="contain"
                                mah={200}
                                flex={1}
                            />
                            <Stack gap="0">
                                <Text>
                                    {tns("cherry-admin-panel.start", {
                                        ns: "pages",
                                    })}
                                </Text>
                                <List mt={rem(4)}>
                                    <List.Item>{tns("cherry-admin-panel.feature1")}</List.Item>
                                    <List.Item>{tns("cherry-admin-panel.feature2")}</List.Item>
                                    <List.Item>{tns("cherry-admin-panel.feature3")}</List.Item>
                                    <List.Item>
                                        <Text c="dimmed">{tns("cherry-admin-panel.feature-more")}</Text>
                                    </List.Item>
                                </List>
                                <Button
                                    component={Link}
                                    to="/admin/machines"
                                    color="cherry.11"
                                    radius="md"
                                    mt="md"
                                    fullWidth
                                >
                                    {tns("start-managing")}
                                </Button>
                            </Stack>
                        </Group>
                    </Card>
                    <Text className={classes.description}>
                        {tns("description2", {
                            ns: "pages",
                        })}
                    </Text>
                    <SimpleGrid
                        cols={2}
                        w={800}
                    >
                        {...cards}
                    </SimpleGrid>
                </Stack>
            </ScrollArea>
        </>
    );
}

export { AdminHomePage as default };
