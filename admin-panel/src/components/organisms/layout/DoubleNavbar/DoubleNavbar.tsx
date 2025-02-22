import { Group } from "@mantine/core";
import Navbar from "../../../molecules/layout/Navbar/Navbar";
import classes from './DoubleNavbar.module.css';
import SecondBar from "../../../molecules/layout/SecondBar/SecondBar";

export default function DoubleNavbar(): React.ReactElement {
    return (
        <Group className={classes.container} gap={0}>
            <Navbar/>
            <SecondBar/>
        </Group>
    );
}
