import { AppShell, Container } from "@mantine/core";
import { Outlet } from "react-router-dom";
import classes from "./PanelLayout.module.css";
import Navbar from "../../molecules/layout/Navbar/Navbar";
import DoubleNavbar from "../../organisms/layout/DoubleNavbar/DoubleNavbar";

export default function NavbarLayout({ doubleNavbar = false }: { doubleNavbar?: boolean }): React.JSX.Element {
    return (
        <AppShell
            padding="sm"
            className={classes.appShell}
            transitionDuration={0}
        >
            <AppShell.Navbar className={classes.appshellNavbar}>{doubleNavbar ? <DoubleNavbar /> : <Navbar />}</AppShell.Navbar>
            <AppShell.Main
                className={classes.appshellMain}
                pl={doubleNavbar ? 275 : 75}
            >
                <Container
                    fluid
                    className={classes.container}
                >
                    <Outlet />
                </Container>
            </AppShell.Main>
        </AppShell>
    );
}
