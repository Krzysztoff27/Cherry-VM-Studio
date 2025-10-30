import { useMemo } from "react";
import { Link } from "react-router-dom";
import PERMISSIONS from "../../../../config/permissions.config";
import { usePermissions } from "../../../../contexts/PermissionsContext";
import useNamespaceTranslation from "../../../../hooks/useNamespaceTranslation";
import TanstackTable from "../../../molecules/display/TanstackTable/TanstackTable";
import CreateMachineSplitButton from "../../../molecules/interactive/CreateMachineSplitButton/CreateMachineSplitButton";
import { getColumns } from "./columns";
import { parseData } from "./data";

const MachinesTable = ({ machines, loading, refresh, error, global }): React.JSX.Element => {
    const { tns } = useNamespaceTranslation("pages", "machines.controls.");
    const { hasPermissions } = usePermissions();

    const viewMode = global && !hasPermissions(PERMISSIONS.MANAGE_ALL_VMS);

    const data = useMemo(() => parseData(machines), [global, machines, viewMode]);
    const columns = useMemo(() => getColumns(global, viewMode), [global, viewMode]);

    return (
        <>
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
                    translations: {
                        filter: tns("filters"),
                    },
                    viewMode: viewMode,
                    hiddenButtons: {
                        import: true,
                        create: true,
                    },
                    additionalButtons: !global
                        ? [
                              {
                                  name: "splitCreate",
                                  component: CreateMachineSplitButton,
                                  children: <>{tns("create-machine")}</>,
                                  props: {
                                      disabled: viewMode,
                                      onSubmit: refresh,
                                  },
                              },
                          ]
                        : [],
                }}
                RowComponent={Link}
                rowProps={(uuid) => ({ to: `/machines/${uuid}` })}
            />
        </>
    );
};

export default MachinesTable;
