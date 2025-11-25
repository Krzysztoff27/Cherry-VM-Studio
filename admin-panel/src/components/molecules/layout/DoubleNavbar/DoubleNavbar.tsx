import { Group } from "@mantine/core";
import Navbar, { NavbarProps } from "../Navbar/Navbar";
import classes from "./DoubleNavbar.module.css";
import SecondBar from "../SecondBar/SecondBar";

export default function DoubleNavbar({ pages }: NavbarProps): React.ReactElement {
    return (
        <Group
            className={classes.container}
            gap={0}
        >
            <Navbar pages={pages} />
            <SecondBar pages={pages} />
        </Group>
    );
}
