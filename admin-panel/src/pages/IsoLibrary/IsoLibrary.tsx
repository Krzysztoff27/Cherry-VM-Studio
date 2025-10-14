import { Paper, Stack } from "@mantine/core";
import classes from "./IsoLibrary.module.css";
import IsoTable from "../../components/organisms/tables/IsoTable/IsoTable";
import { useState } from "react";
import { useDisclosure } from "@mantine/hooks";
import IsoFileModal from "../../modals/iso-file-library/IsoFileModal/IsoFileModal";
import useFetch from "../../hooks/useFetch";

const IsoLibrary = (): React.JSX.Element => {
    const [currentUuid, setCurrentUuid] = useState<string>("");
    const [modalOpened, { open, close }] = useDisclosure(false);
    const { data, loading, error, refresh } = useFetch("iso");

    const openIsoFileModal = (uuid: string) => {
        setCurrentUuid(uuid);
        open();
    };

    return (
        <Stack w="100%">
            <IsoFileModal
                opened={modalOpened}
                onClose={close}
                uuid={currentUuid}
                refreshTable={refresh}
            />

            <Paper className={classes.tablePaper}>
                <IsoTable
                    data={data}
                    loading={loading}
                    error={error}
                    refresh={refresh}
                    openIsoFileModal={openIsoFileModal}
                />
            </Paper>
        </Stack>
    );
};

export default IsoLibrary;
