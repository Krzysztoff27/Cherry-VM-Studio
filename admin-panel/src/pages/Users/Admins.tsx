import React from "react";
import AccountTable from "../../components/organisms/AccountTable/AccountTable";
import { Paper, Stack } from "@mantine/core";
import classes from './Admins.module.css';

const Admins = () : React.JSX.Element => {
    return (
        <Stack w='100%'>
            <Paper className={classes.tablePaper}>
                <AccountTable/>
            </Paper>

        </Stack>
    );
}

export default Admins;