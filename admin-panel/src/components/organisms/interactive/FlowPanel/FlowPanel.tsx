import { Button } from "@mantine/core";
import { Panel } from "@xyflow/react";
import AddSnapshotButton from "../../../molecules/interactive/AddSnapshotButton/AddSnapshotButton";
import ModifySnapshotsButton from "../../../molecules/interactive/ModifySnapshotsButton/ModifySnapshotsButton";
import SnapshotSelect from "../../../molecules/interactive/SnapshotSelect/SnapshotSelect";
import { useToggle } from "@mantine/hooks";
import RefreshFlowMachinesButton from "../../../molecules/interactive/RefreshFlowMachinesButton/RefreshFlowMachinesButton";
import ApplyRestoreButtonPair from "../ApplyRestoreButtonPair/ApplyRestoreButtonPair";

export default function FlowPanel({ resetFlow, applyNetworkConfig, isDirty, loadSnapshot, loadPreset, refreshMachines, postSnapshot }) {
    const [forceSnapshotDataUpdate, initiateSnapshotDataUpdate] = useToggle([false, true]);

    return (
        <>
            <Panel position="top-center">
                <Button.Group>
                    <AddSnapshotButton
                        postSnapshot={postSnapshot}
                        initiateSnapshotDataUpdate={initiateSnapshotDataUpdate}
                    />
                    <ModifySnapshotsButton
                        forceSnapshotDataUpdate={forceSnapshotDataUpdate}
                        initiateSnapshotDataUpdate={initiateSnapshotDataUpdate}
                    />
                    <SnapshotSelect
                        loadSnapshot={loadSnapshot}
                        loadPreset={loadPreset}
                        forceSnapshotDataUpdate={forceSnapshotDataUpdate}
                    />
                    <ApplyRestoreButtonPair
                        isDirty={isDirty}
                        applyNetworkConfig={applyNetworkConfig}
                        resetFlow={resetFlow}
                    />
                    <RefreshFlowMachinesButton
                        refreshMachines={refreshMachines}
                        isDirty={isDirty}
                    />
                </Button.Group>
            </Panel>
        </>
    );
}
