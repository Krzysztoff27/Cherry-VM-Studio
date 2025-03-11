import AccountTable from "../../../components/organisms/AccountTable/AccountTable";
import classes from "./Admins.module.css";
import { Paper, Stack } from "@mantine/core";

const Admins = (): React.JSX.Element => {
    return (
        <Stack w="100%">
            <Paper className={classes.tablePaper}>
                <AccountTable accountType="administrative" />
            </Paper>
        </Stack>
    );
};

export default Admins;
