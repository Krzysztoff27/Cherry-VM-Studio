import GroupsTable from "../../../components/organisms/GroupsTable/GroupsTable";
import useFetch from "../../../hooks/useFetch";
import classes from "./Groups.module.css";
import { Paper, Stack } from "@mantine/core";

const Groups = (): React.JSX.Element => {
    const { data: groupData, error: groupError, loading: groupLoading, refresh: groupRefresh } = useFetch(`/groups`);
    const { data: userData, error: userError, loading: userLoading, refresh: userRefresh } = useFetch("/users?account_type=client");

    return (
        <Stack w="100%">
            <Paper className={classes.tablePaper}>
                <GroupsTable
                    userData={userData}
                    groupData={groupData}
                    error={groupError || userError}
                    loading={groupLoading || userLoading}
                    refresh={() => {
                        groupRefresh();
                        userRefresh();
                    }}
                />
            </Paper>
        </Stack>
    );
};

export default Groups;
