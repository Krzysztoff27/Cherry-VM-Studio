import { AppShell } from '@mantine/core'
import React from 'react'
import { Outlet } from 'react-router-dom'
import Footer from '../Footer/Footer'

/**
 * Layout used in the readonly subpages, such as Home, Credits, Copyright etc.
 * @returns {React.JSX.Element} Layout element
 */
export default function HomeLayout() {
    return (
        <AppShell>
            <AppShell.Main w={'100%'}>
                <Outlet/>
            </AppShell.Main>
            <AppShell.Footer p='sm'>
                <Footer/>
            </AppShell.Footer>
        </AppShell>
    )
}
