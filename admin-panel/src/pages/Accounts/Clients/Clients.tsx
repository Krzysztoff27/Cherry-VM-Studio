import React from "react";
import AccountTable from "../../../components/organisms/AccountTable/AccountTable";
import { Paper, Stack } from "@mantine/core";
import classes from "./Clients.module.css";

const Clients = (): React.JSX.Element => {
    return (
        <Stack w="100%">
            <Paper className={classes.tablePaper}>
                <AccountTable accountType="client" />
            </Paper>
        </Stack>
    );
};

export default Clients;
