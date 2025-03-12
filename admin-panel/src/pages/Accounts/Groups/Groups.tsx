import GroupsTable from "../../../components/organisms/GroupsTable/GroupsTable";
import classes from "./Groups.module.css";
import { Paper, Stack } from "@mantine/core";

const Groups = (): React.JSX.Element => {
    return (
        <Stack w="100%">
            <Paper className={classes.tablePaper}>
                <GroupsTable />
            </Paper>
        </Stack>
    );
};

export default Groups;
