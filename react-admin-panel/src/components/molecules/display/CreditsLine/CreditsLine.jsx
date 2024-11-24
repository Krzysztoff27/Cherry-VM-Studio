import { Avatar, AvatarGroup, Group, Text } from "@mantine/core";
import classes from './CreditsLine.module.css';
import { useTranslation } from 'react-i18next'

export default function CreditsLine({ data }) {
    const { t } = useTranslation()
    const names = data.contributors.map(contributor => <a href={contributor.url} className={classes.contributorLink}>{contributor.name}</a>);
    const isCherry = data.key.search(/cherry/i) !== -1;

    return (
        <Group justify='space-between'>
            <Text size='lg' fs={isCherry ? 'italic' : ''} >{t(`credits.${data.key}`, {ns: 'pages'})}</Text>
            <Group>
                <Text c='gray.5'>{...names}</Text>
                <AvatarGroup>
                    {...data.contributors.map((contributor, i) => 
                        <Avatar 
                            key={i}
                            name={contributor.name}
                            alt={contributor.name} 
                            src={contributor.avatar}
                        />
                    )}
                </AvatarGroup>
            </Group>
        </Group>
    )
}