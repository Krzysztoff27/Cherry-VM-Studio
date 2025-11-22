import { useMemo } from "react";
import useNamespaceTranslation from "../../../../hooks/useNamespaceTranslation";
import { getColumns } from "./columns";
import { safeObjectValues } from "../../../../utils/misc";
import { Snapshot } from "../../../../types/api.types";
import TanstackTable from "../../../molecules/display/TanstackTable/TanstackTable";
import { AxiosError } from "axios";
import CreateTemplateModal from "../../../../modals/templates-library/CreateTemplateModal/CreateTemplateModal";

export interface SnapshotsTableProps {
    snapshots: Record<string, Snapshot>;
    loading: boolean;
    error: AxiosError | null;
    refresh: () => void;
    openTemplateModal: (uuid: string) => void;
}

const TemplatesTable = ({ snapshots, loading, error, refresh, openTemplateModal }: SnapshotsTableProps): React.JSX.Element => {
    const { tns } = useNamespaceTranslation("pages", "templates.controls.");
    const data = useMemo(() => safeObjectValues(snapshots), [snapshots]);
    const columns = useMemo(() => getColumns(openTemplateModal), []);

    return (
        <TanstackTable
            data={data}
            columns={columns}
            error={error}
            loading={loading}
            refresh={refresh}
            headingProps={{
                translations: {
                    all: tns("all-templates"),
                    selected: tns("selected-templates"),
                    filtered: tns("filtered-results"),
                },
            }}
            controlsProps={{
                modals: {
                    create: { component: CreateTemplateModal },
                },
                translations: {
                    import: tns("import"),
                    filter: tns("filters"),
                    delete: tns("delete-selected"),
                    create: tns("create-template"),
                },
                searchColumnKey: "name",
            }}
        />
    );
};

export default TemplatesTable;
