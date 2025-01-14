import { Avatar, Button, Card, Group, Image, List, rem, ScrollArea, SimpleGrid, Stack, Text, Title } from '@mantine/core';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import classes from './Home.module.css';
import urlConfig from '../../config/url.config';

const panels = [
    {
        name: 'guacamole',
        link: urlConfig.guacamole,
        color: '#578c34',
        icon: '/icons/Apache Guacamole.webp',
    },
    {
        name: 'traefik',
        link: urlConfig.traefik,
        color: '#24A0C1',
        icon: '/icons/Traefik Proxy.webp',
    },

]

export default function Home() {
    const { t } = useTranslation();

    const cards = panels.map((panel, i) => (
        <Card key={i} shadow='sm' className={classes.card} withBorder>
            <Stack className={classes.cardStack1}>
                <Stack className={classes.cardStack2}>
                    <Group className={classes.cardGroup}>
                        <Avatar
                            src={panel.icon}
                            title={t(`home.cards.${panel.name}.title`, { ns: 'pages' })}
                            alt={t(`home.cards.${panel.name}.logo-alt`, { ns: 'pages' })}
                        />
                        <Text className={classes.panelTitle}>
                            {t(`home.cards.${panel.name}.title`, { ns: 'pages' })}
                        </Text>
                    </Group>
                    <Text size='sm' c='dimmed'>
                        {t(`home.cards.${panel.name}.description`, { ns: 'pages' })}
                    </Text>
                </Stack>
                <Button
                    component="a"
                    href={panel.link}
                    color={panel.color}
                    radius='md'
                    fullWidth
                >
                    {t('log-in',)}
                </Button>
            </Stack>
        </Card>
    ))

    return (
        <ScrollArea.Autosize w='100%'>
            <Stack className={classes.container}>
                <Stack align='center'>
                    <Title>{t('home.title', { ns: 'pages' })}</Title>
                    <Text className={classes.description}>{t('home.description1', { ns: 'pages' })}</Text>

                </Stack>
                <Card className={`${classes.card} ${classes.main}`} shadow='sm' withBorder>
                    <Group>
                        <Image
                            src='/icons/Cherry Admin Panel.webp'
                            fit="contain"
                            mah={200}
                            flex={1}
                        />
                        <Stack gap='0'>
                            <Text>{t('home.cherry-admin-panel.start', { ns: 'pages' })}</Text>
                            <List mt={rem(4)}>
                                <List.Item>{t('home.cherry-admin-panel.feature1', { ns: 'pages' })}</List.Item>
                                <List.Item>{t('home.cherry-admin-panel.feature2', { ns: 'pages' })}</List.Item>
                                <List.Item>{t('home.cherry-admin-panel.feature3', { ns: 'pages' })}</List.Item>
                                <List.Item><Text c='dimmed'>{t('home.cherry-admin-panel.feature-more', { ns: 'pages' })}</Text></List.Item>
                            </List>
                            <Button component={Link} to='/login' color='cherry.10' radius='md' mt='md' fullWidth>
                                {t('enter')}
                            </Button>
                        </Stack>
                    </Group>
                </Card>
                <Text className={classes.description}>{t('home.description2', { ns: 'pages' })}</Text>
                <SimpleGrid cols={2} w={800}>
                    {...cards}
                </SimpleGrid>
            </Stack>
        </ScrollArea.Autosize>
    )
}
