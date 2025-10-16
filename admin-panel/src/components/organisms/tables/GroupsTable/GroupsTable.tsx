import { useMemo } from "react";
import { getColumns } from "./columns";
import { prepareData } from "./data";
import { Group } from "../../../../types/api.types";
import useNamespaceTranslation from "../../../../hooks/useNamespaceTranslation";
import TanstackTable from "../../../molecules/display/TanstackTable/TanstackTable";
import DeleteGroupsModal from "../../../../modals/account/DeleteGroupsModal/DeleteGroupsModal";
import CreateGroupModal from "../../../../modals/account/CreateGroupModal/CreateGroupModal";

export interface GroupsTableProps {
    groups: Record<string, Group>;
    error: Response | null;
    loading: boolean;
    refresh: () => void;
    openGroupModal: (uuid: string) => void;
}

const GroupsTable = ({ groups, error, loading, refresh, openGroupModal }: GroupsTableProps): React.JSX.Element => {
    const { tns } = useNamespaceTranslation("pages", "accounts.controls");

    const data = useMemo(() => prepareData(groups), [groups]);
    const columns = useMemo(() => getColumns(openGroupModal), [refresh, openGroupModal]);

    return (
        <TanstackTable
            data={data}
            columns={columns}
            error={error}
            loading={loading}
            refresh={refresh}
            headingProps={{
                translations: {
                    all: tns("all-groups"),
                    selected: tns("selected-groups"),
                    filtered: tns("filtered-results"),
                },
            }}
            controlsProps={{
                modals: {
                    create: {
                        component: CreateGroupModal,
                        props: { onSubmit: refresh },
                    },
                    delete: {
                        component: DeleteGroupsModal,
                    },
                },
                translations: {
                    create: tns("create-group"),
                    delete: tns("delete-selected"),
                    filter: tns("filters"),
                    import: tns("import"),
                },
            }}
        />
    );
};

export default GroupsTable;
