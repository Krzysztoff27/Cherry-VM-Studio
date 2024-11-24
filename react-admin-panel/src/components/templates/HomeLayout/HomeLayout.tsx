import LanguageSwitch from '../../molecules/interactive/LanguageSwitch/LanguageSwitch'
import Footer from '../../organisms/Footer/Footer'
import { AppShell, Group } from '@mantine/core'
import { Outlet } from 'react-router-dom'
import React from 'react'

/**
 * Layout used in the readonly subpages, such as Home, Credits, Copyright etc.
 */

export default function HomeLayout(): React.ReactElement {
    return (
        <AppShell>
            <AppShell.Header p='sm' bd='none' bg='transparent'>
                <Group w='100%' justify='flex-end'>
                    <LanguageSwitch position='bottom' />
                </Group>
            </AppShell.Header>
            <AppShell.Main w={'100%'}>
                <Outlet />
            </AppShell.Main>
            <AppShell.Footer p='sm'>
                <Footer />
            </AppShell.Footer>
        </AppShell>
    )
}
