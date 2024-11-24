import { AppShell, Container } from "@mantine/core";
import { Outlet } from "react-router-dom";
import classes from './PanelLayout.module.css';
import NavBar from "../../organisms/Navbar/NavBar.tsx";
import React from "react";

export default function PanelLayout(): React.JSX.Element {
    return (
        <AppShell
            padding="sm"
            className={classes.appShell}
        >
            <AppShell.Navbar className={classes.appshellNavbar}>
                <NavBar />
            </AppShell.Navbar>
            <AppShell.Main className={classes.appshellMain}>
                <Container fluid className={classes.container}>
                    <Outlet/>
                </Container>
            </AppShell.Main>
        </AppShell>
    )
}
