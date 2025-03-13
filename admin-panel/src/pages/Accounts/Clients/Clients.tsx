import React from "react";
import AccountTable from "../../../components/organisms/AccountTable/AccountTable";
import { Paper, Stack } from "@mantine/core";
import classes from "./Clients.module.css";
import useFetch from "../../../hooks/useFetch";

const Clients = (): React.JSX.Element => {
    const { data, error, loading, refresh } = useFetch(`/users?account_type=client`);

    return (
        <Stack w="100%">
            <Paper className={classes.tablePaper}>
                <AccountTable
                    accountType="client"
                    userData={data}
                    error={error}
                    loading={loading}
                    refresh={refresh}
                />
            </Paper>
        </Stack>
    );
};

export default Clients;
