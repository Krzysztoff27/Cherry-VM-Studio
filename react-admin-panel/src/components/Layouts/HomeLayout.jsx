import { AppShell, Group } from '@mantine/core'
import React from 'react'
import { Outlet } from 'react-router-dom'
import Footer from '../Footer/Footer'
import LanguageSwitch from '../LanguageSwitch/LanguageSwitch'

/**
 * Layout used in the readonly subpages, such as Home, Credits, Copyright etc.
 * @returns {React.JSX.Element} Layout element
 */
export default function HomeLayout() {
    return (
        <AppShell>
            <AppShell.Header p='sm' bd='none'>
                <Group w='100%' justify='flex-end'>
                    <LanguageSwitch position='bottom'/>
                </Group>
            </AppShell.Header>
            <AppShell.Main w={'100%'}>
                <Outlet/>
            </AppShell.Main>
            <AppShell.Footer p='sm'>
                <Footer/>
            </AppShell.Footer>
        </AppShell>
    )
}
