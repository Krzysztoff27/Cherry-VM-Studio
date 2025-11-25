import { AppShell, Container } from "@mantine/core";
import { Outlet } from "react-router-dom";
import classes from "./PanelLayout.module.css";
import Navbar from "../../molecules/layout/Navbar/Navbar";
import DoubleNavbar from "../../molecules/layout/DoubleNavbar/DoubleNavbar";
import { AccountType } from "../../../types/config.types";
import { ADMIN_PANEL_PAGES, CLIENT_PANEL_PAGES } from "../../../config/pages.config";

export interface NavbarLayoutProps {
    doubleNavbar?: boolean;
    account_type: AccountType;
}

export default function NavbarLayout({ doubleNavbar = false, account_type }: NavbarLayoutProps): React.JSX.Element {
    const NavbarComponent = doubleNavbar ? DoubleNavbar : Navbar;

    return (
        <AppShell
            padding="sm"
            className={classes.appShell}
            transitionDuration={0}
        >
            <AppShell.Navbar className={classes.appshellNavbar}>
                <NavbarComponent pages={account_type === "administrative" ? ADMIN_PANEL_PAGES : CLIENT_PANEL_PAGES} />
            </AppShell.Navbar>
            <AppShell.Main
                className={classes.appshellMain}
                pl={doubleNavbar ? 295 : 75}
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
