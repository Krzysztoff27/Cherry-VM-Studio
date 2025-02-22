import React from "react";
import UsersTable from "../../components/organisms/UsersTable/UsersTable";
import { Paper } from "@mantine/core";

const Admins = () : React.JSX.Element => {
    return (
        <>
            <Paper w='100%' bg="dark.8" radius='20px' p='xl'>
                <UsersTable/>
            </Paper>

        </>
    );
}

export default Admins;