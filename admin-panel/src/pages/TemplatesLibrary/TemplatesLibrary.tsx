import { Paper, Stack } from "@mantine/core";
import classes from "./TemplatesLibrary.module.css";
import TemplatesTable from "../../components/organisms/tables/TemplatesTable/TemplatesTable";
import useFetch from "../../hooks/useFetch";

const TemplatesLibrary = (): React.JSX.Element => {
    const { data, error, loading, refresh } = useFetch("machine/templates");

    return (
        <Stack w="100%">
            <Paper className={classes.tablePaper}>
                <TemplatesTable
                    templates={data}
                    loading={loading}
                    error={error}
                    refresh={refresh}
                />
            </Paper>
        </Stack>
    );
};

export default TemplatesLibrary;
