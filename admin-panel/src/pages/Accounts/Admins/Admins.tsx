import AccountTable from "../../../components/organisms/AccountTable/AccountTable";
import useFetch from "../../../hooks/useFetch";
import classes from "./Admins.module.css";
import { Paper, Stack } from "@mantine/core";

const Admins = (): React.JSX.Element => {
    const { data, error, loading, refresh } = useFetch(`/users?account_type=administrative`);

    return (
        <Stack w="100%">
            <Paper className={classes.tablePaper}>
                <AccountTable
                    accountType="administrative"
                    userData={data}
                    error={error}
                    loading={loading}
                    refresh={refresh}
                />
            </Paper>
        </Stack>
    );
};

export default Admins;
