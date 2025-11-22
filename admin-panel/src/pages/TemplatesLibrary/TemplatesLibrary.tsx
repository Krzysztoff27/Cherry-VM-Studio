import { Paper, Stack } from "@mantine/core";
import classes from "./TemplatesLibrary.module.css";
import TemplatesTable from "../../components/organisms/tables/TemplatesTable/TemplatesTable";
import TemplateModal from "../../modals/templates-library/TemplateModal/TemplateModal";
import { useDisclosure } from "@mantine/hooks";
import { useState } from "react";

const DUMMY_DATA = {
    "b7422eda-e4c8-456b-a325-9ff8359fb0d3": {
        uuid: "b7422eda-e4c8-456b-a325-9ff8359fb0d3",
        name: "Server Configuration Template",
        created: "2025-10-17 19:30",
        owner: {
            uuid: "83212b1e-b222-4bba-a1d4-450e08cbbeb1",
            username: "root",
        },
    },
    "83212b1e-b222-4bba-a1d4-450e08cbbeb1": {
        uuid: "83212b1e-b222-4bba-a1d4-450e08cbbeb1",
        name: "Lightweight",
        created: "2025-10-17 19:49",
        owner: { uuid: "83212b1e-b222-4bba-a1d4-450e08cbbeb1", username: "Gato Calico" },
    },
};

const TemplatesLibrary = (): React.JSX.Element => {
    const [currentUuid, setCurrentUuid] = useState<string>("");

    const [modalOpened, { open, close }] = useDisclosure(false);

    const openTemplateModal = (uuid: string) => {
        setCurrentUuid(uuid);
        open();
    };

    const refresh = () => {};

    return (
        <Stack w="100%">
            <TemplateModal
                opened={modalOpened}
                onClose={close}
                uuid={currentUuid}
                refreshTable={refresh}
            />

            <Paper className={classes.tablePaper}>
                <TemplatesTable
                    snapshots={DUMMY_DATA}
                    loading={false}
                    error={null}
                    refresh={() => {}}
                    openTemplateModal={openTemplateModal}
                />
            </Paper>
        </Stack>
    );
};

export default TemplatesLibrary;
