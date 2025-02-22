import Footer from '../../organisms/layout/Footer/Footer'
import { AppShell } from '@mantine/core'
import { Outlet } from 'react-router-dom'
import React from 'react'
import HomeHeader from '../../organisms/HomeHeader/HomeHeader'
import classes from './HomeLayout.module.css';

/**
 * Layout used in the readonly subpages, such as Home, Credits, Copyright etc.
 */

export default function HomeLayout(): React.ReactElement {
    return (
        <AppShell className={classes.appShell}>
            <AppShell.Header p='sm' bd='none' bg='transparent'>
                <HomeHeader/>
            </AppShell.Header>
            <AppShell.Main w={'100%'} className={classes.appshellMain}>
                <Outlet />
            </AppShell.Main>
            <AppShell.Footer p='sm'>
                <Footer />
            </AppShell.Footer>
        </AppShell>
    )
}
