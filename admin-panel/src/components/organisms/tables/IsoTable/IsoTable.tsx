import { useMemo } from "react";
import useNamespaceTranslation from "../../../../hooks/useNamespaceTranslation";
import DeleteIsoModal from "../../../../modals/iso-file-library/DeleteIsoModal/DeleteIsoModal";
import IsoFileImportModal from "../../../../modals/iso-file-library/IsoFileImportModal/IsoFileImportModal";
import { IsoFile } from "../../../../types/api.types";
import { safeObjectValues } from "../../../../utils/misc";
import TanstackTable from "../../../molecules/display/TanstackTable/TanstackTable";
import { getColumns } from "./columns";

export interface IsoTableProps {
    isoFiles: Record<string, IsoFile>;
    loading: boolean;
    error: Response | null;
    refresh: () => void;
    openIsoFileModal: (uuid: string) => void;
}

const IsoTable = ({ isoFiles, loading, error, refresh, openIsoFileModal }: IsoTableProps): React.JSX.Element => {
    const { tns } = useNamespaceTranslation("pages", "iso.controls.");

    const data = useMemo(() => safeObjectValues(isoFiles), [isoFiles]);
    const columns = useMemo(() => getColumns(openIsoFileModal), []);

    return (
        <TanstackTable
            data={data}
            columns={columns}
            error={error}
            loading={loading}
            refresh={refresh}
            headingProps={{
                translations: {
                    all: tns("all-files"),
                    selected: tns("selected-files"),
                    filtered: tns("filtered-results"),
                },
            }}
            controlsProps={{
                modals: {
                    create: {
                        component: IsoFileImportModal,
                        props: { onSubmit: refresh },
                    },
                    delete: {
                        component: DeleteIsoModal,
                    },
                },
                translations: {
                    create: tns("add-iso-file"),
                    import: tns("import"),
                    filter: tns("filters"),
                    delete: tns("delete-selected"),
                },
                withImports: false,
                searchColumnKey: "name",
            }}
        />
    );
};

export default IsoTable;
