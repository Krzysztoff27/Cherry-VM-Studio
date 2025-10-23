import { useMemo } from "react";
import useNamespaceTranslation from "../../../../hooks/useNamespaceTranslation";
import { Link } from "react-router-dom";
import PERMISSIONS from "../../../../config/permissions.config";
import CreateMachineModal from "../../../../modals/machines/CreateMachineModal/CreateMachineModal";
import { getColumns } from "./columns";
import { parseData } from "./data";
import TanstackTable from "../../../molecules/display/TanstackTable/TanstackTable";
import { usePermissions } from "../../../../contexts/PermissionsContext";

const MachinesTable = ({ machines, loading, refresh, error, global }): React.JSX.Element => {
    const { tns } = useNamespaceTranslation("pages", "machines.controls.");
    const { hasPermissions } = usePermissions();

    const viewMode = global && !hasPermissions(PERMISSIONS.MANAGE_ALL_VMS);

    const data = useMemo(() => parseData(machines), [global, machines, viewMode]);
    const columns = useMemo(() => getColumns(global, viewMode), [global, viewMode]);

    return (
        <TanstackTable
            data={data}
            columns={columns}
            loading={loading}
            refresh={refresh}
            error={error}
            headingProps={{
                translations: {
                    all: tns(global ? "all-machines" : "your-machines"),
                    filtered: tns("filtered-results"),
                    selected: "",
                },
            }}
            controlsProps={{
                modals: {
                    create: {
                        component: CreateMachineModal,
                        props: {},
                    },
                },
                translations: {
                    create: tns("create-machine"),
                    filter: tns("filters"),
                },
                viewMode: viewMode,
                withImports: false,
                withCreation: !global,
            }}
            RowComponent={Link}
            rowProps={(uuid) => ({ to: `/machines/${uuid}` })}
        />
    );
};

export default MachinesTable;
