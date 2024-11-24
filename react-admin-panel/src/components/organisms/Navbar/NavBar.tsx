import { Stack } from '@mantine/core';
import { IconDeviceDesktop, IconHome, IconLogout, IconTerminal2, IconTopologyStar } from '@tabler/icons-react';
import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import useAuth from '../../../hooks/useAuth.ts';
import useNamespaceTranslation from '../../../hooks/useNamespaceTranslation';
import LanguageSwitch from '../../molecules/interactive/LanguageSwitch/LanguageSwitch.jsx';
import TooltipIconButton from '../../molecules/interactive/TooltipIconButton/TooltipNavButton.tsx';
import classes from './NavBar.module.css';

const categories = [
    { icon: IconHome, name: "home", link: '/home' },
    { icon: IconTerminal2, name: "virtual-machines", link: '/virtual-machines' },
    { icon: IconDeviceDesktop, name: "desktops", link: '/desktops', disabled: true },
    { icon: IconTopologyStar, name: "network-panel", link: '/network-panel' },
]

export default function NavBar(): React.ReactElement {
    const { t, tns } = useNamespaceTranslation('layouts');
    const { logout } = useAuth();
    const location = useLocation();
    const [active, setActive] = useState<number>();

    useEffect(() => setActive(categories.findIndex(cat => location.pathname.startsWith(cat.link))),
        [location.pathname]);

    return (
        <Stack className={classes.navBar}>
            <Stack gap='md'>
                {categories.map((category, i) => (
                    <TooltipIconButton
                        key={i}
                        component={Link}
                        to={category.link}
                        active={active === i}
                        label={tns(`navbar.${category.name}`)}
                        icon={<category.icon stroke={1.5} />}
                    />
                ))}
            </Stack>
            <Stack>
                <LanguageSwitch />
                <TooltipIconButton 
                    onClick={logout} 
                    label={t('log-out')} 
                    icon={<IconLogout stroke={1.5}/>} 
                />
            </Stack>
        </Stack>
    )
}
