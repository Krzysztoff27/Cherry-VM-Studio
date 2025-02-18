import { Stack } from "@mantine/core";
import { useTranslation } from "react-i18next";
import Loading from "../../atoms/feedback/Loading/Loading.tsx";
import useFetch from "../../../hooks/useFetch.ts";
import MachineHeading from "../../organisms/MachineHeading/MachineHeading.tsx";
import MachineDataTable from "../../organisms/MachineDataTable/MachineDataTable.tsx";

export default function MachineDataDisplay({ currentState, uuid }) {
    const { t } = useTranslation();
    const { loading, error, data: machine } = useFetch(`/vm/${uuid}/networkdata`);

    if (loading) return <Loading />;
    if (error) throw error;

    return (
        <Stack>
            <MachineHeading machine={machine} currentState={currentState}/>
            <MachineDataTable machine={machine} currentState={currentState} t={t} />
        </Stack>
    )
}
