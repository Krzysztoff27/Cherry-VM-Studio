import { Divider, NavLink, Stack, Text, Title } from '@mantine/core';
import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import useAuth from '../../../../hooks/useAuth.ts';
import useNamespaceTranslation from '../../../../hooks/useNamespaceTranslation.ts';
import classes from './SecondBar.module.css';
import PAGES from '../../../../config/pages.config.ts';
import { Page } from '../../../../types/config.types.ts';


export default function SecondBar(): React.ReactElement {
    const { t, tns } = useNamespaceTranslation('layouts');
    const location = useLocation();
    const [page, setPage] = useState<Page>();
    const [active, setActive] = useState<number>();

    useEffect(() => {
        const page = PAGES.find(p => location.pathname.startsWith(p.path));
        setActive(page?.subpages?.findIndex(subpage => location.pathname.startsWith(subpage.path)) ?? -1);
        setPage(page);
    }, [location.pathname]);

    return (
        <Stack className={classes.navbar}>
            <Divider 
                color='dark.5'
                size='sm' 
                w='90%'
                mb='0.5rem'
            />
            {page?.subpages?.map((subpage, i) =>
                <NavLink
                    component={Link}
                    to={subpage.path}
                    leftSection={<subpage.icon/>}
                    label={tns(`navbar.${subpage.key}`)}
                    key={subpage.key}
                    className={classes.navLink}
                />
            )}
        </Stack>
    )
}
