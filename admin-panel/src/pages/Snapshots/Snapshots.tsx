import { Paper, Stack } from "@mantine/core";
import classes from "./Snapshots.module.css";
import SnapshotsTable from "../../components/organisms/tables/SnapshotsTable/SnapshotsTable";

const DUMMY_DATA = {
    "b7422eda-e4c8-456b-a325-9ff8359fb0d3": {
        uuid: "b7422eda-e4c8-456b-a325-9ff8359fb0d3",
        name: "OpenSUSE Leap 15.6 Clean",
        created: "2025-10-17 19:30",
        owner: {
            uuid: "83212b1e-b222-4bba-a1d4-450e08cbbeb1",
            username: "root",
        },
        sharedWith: [
            {
                uuid: "b7422eda-e4c8-456b-a325-9ff8359fb0d3",
                username: "Meowzer",
            },
            {
                uuid: "b7422eda-e4c8-456b-a325-9ff8359fb0d3",
                username: "Nyan",
            },
            {
                uuid: "b7422eda-e4c8-456b-a325-9ff8359fb0d3",
                username: "Neow",
            },
        ],
        size: "25 MB",
    },
    "83212b1e-b222-4bba-a1d4-450e08cbbeb1": {
        uuid: "83212b1e-b222-4bba-a1d4-450e08cbbeb1",
        name: "SUSE with Network Services",
        created: "2025-10-17 19:49",
        owner: { uuid: "83212b1e-b222-4bba-a1d4-450e08cbbeb1", username: "Gato Calico" },
        size: "42 MB",
    },
};

const Snapshots = (): React.JSX.Element => {
    return (
        <Stack w="100%">
            <Paper className={classes.tablePaper}>
                <SnapshotsTable
                    snapshotData={DUMMY_DATA}
                    loading={false}
                    error={null}
                />
            </Paper>
        </Stack>
    );
};

export default Snapshots;
