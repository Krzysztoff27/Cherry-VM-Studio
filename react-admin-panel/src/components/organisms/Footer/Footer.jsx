import { Group, rem, SimpleGrid, Text } from "@mantine/core";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

export default function Footer() {
    const { t } = useTranslation();

    return (
        <Group w='100%' justify='center'>
            <SimpleGrid w={rem(900)} cols={4} ta='center' c='dimmed'>
                <Text component={Link} to='/'>
                    {t('footer.home', { ns: 'layouts' })}
                </Text>
                <Text component={Link} to='/documents'>
                    {t('footer.documentation', { ns: 'layouts' })}
                </Text>
                <Text component={Link} to='/credits'>
                    {t('footer.credits', { ns: 'layouts' })}
                </Text>
                <Text component={Link} to='/copyright'>
                    {t('footer.copyright', { ns: 'layouts' })}
                </Text>
            </SimpleGrid>
        </Group>
    )
}
