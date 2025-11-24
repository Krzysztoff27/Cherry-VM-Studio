import { Paper, Stack } from "@mantine/core";
import classes from "./IsoLibrary.module.css";
import IsoTable from "../../components/organisms/tables/IsoTable/IsoTable";
import useFetch from "../../hooks/useFetch";

const IsoLibrary = (): React.JSX.Element => {
    const { data, loading, error, refresh } = useFetch("iso");

    return (
        <Stack w="100%">
            <Paper className={classes.tablePaper}>
                <IsoTable
                    isoFiles={data}
                    loading={loading}
                    error={error}
                    refresh={refresh}
                />
            </Paper>
        </Stack>
    );
};

export default IsoLibrary;
