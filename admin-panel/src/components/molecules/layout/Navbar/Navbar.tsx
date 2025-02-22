import { Stack } from '@mantine/core';
import { IconLogout } from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import useAuth from '../../../../hooks/useAuth.ts';
import useNamespaceTranslation from '../../../../hooks/useNamespaceTranslation.ts';
import LanguageSwitch from '../../interactive/LanguageSwitch/LanguageSwitch.jsx';
import TooltipIconButton from '../../interactive/TooltipIconButton/TooltipNavButton.tsx';
import classes from './Navbar.module.css';
import PAGES from '../../../../config/pages.config.ts';
import { safeObjectValues } from '../../../../utils/misc.js';

export default function Navbar(): React.ReactElement {
    const { t, tns } = useNamespaceTranslation('layouts');
    const { logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [active, setActive] = useState<number>();

    useEffect(() => setActive(PAGES.findIndex(cat => location.pathname.startsWith(cat.path))),
        [location.pathname]
    );

    const onClickLogout = () => {
        logout();
        navigate('/');
    }

    return (
        <Stack className={classes.navbar}>
            <Stack gap='md'>
                {PAGES.map((category, i) => (
                    <TooltipIconButton
                        key={i}
                        component={Link}
                        to={category.path}
                        active={active === i}
                        label={tns(`navbar.${category.key}`)}
                        icon={<category.icon stroke={1.5} />}
                    />
                ))}
            </Stack>
            <Stack>
                <LanguageSwitch />
                <TooltipIconButton 
                    onClick={onClickLogout} 
                    label={t('log-out')} 
                    icon={<IconLogout stroke={1.5}/>} 
                />
            </Stack>
        </Stack>
    )
}
