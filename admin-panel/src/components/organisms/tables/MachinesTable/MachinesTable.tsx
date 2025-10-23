import { useMemo, useState } from "react";
import useNamespaceTranslation from "../../../../hooks/useNamespaceTranslation";
import { Link } from "react-router-dom";
import PERMISSIONS from "../../../../config/permissions.config";
import { getColumns } from "./columns";
import { parseData } from "./data";
import TanstackTable from "../../../molecules/display/TanstackTable/TanstackTable";
import { usePermissions } from "../../../../contexts/PermissionsContext";
import SplitButton from "../../../atoms/interactive/SplitButton/SplitButton";
import { IconDeviceDesktopPlus, IconDevices2 } from "@tabler/icons-react";
import classes from "./MachinesTable.module.css";
import { Portal } from "@mantine/core";
import CreateMachineModal from "../../../../modals/machines/CreateMachineModal/CreateMachineModal";

const MachinesTable = ({ machines, loading, refresh, error, global }): React.JSX.Element => {
    const [modalOpened, setModalOpened] = useState(false);
    const { tns, t } = useNamespaceTranslation("pages", "machines.controls.");
    const { hasPermissions } = usePermissions();

    const viewMode = global && !hasPermissions(PERMISSIONS.MANAGE_ALL_VMS);

    const data = useMemo(() => parseData(machines), [global, machines, viewMode]);
    const columns = useMemo(() => getColumns(global, viewMode), [global, viewMode]);

    return (
        <>
            <Portal>
                <CreateMachineModal
                    opened={modalOpened}
                    onClose={() => setModalOpened(false)}
                    onSubmit={refresh}
                />
            </Portal>
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
                    additionalButtons: global
                        ? undefined
                        : [
                              {
                                  name: "splitCreate",
                                  component: SplitButton,
                                  children: <>{tns("create-machine")}</>,
                                  props: {
                                      leftSection: (
                                          <IconDeviceDesktopPlus
                                              size={16}
                                              stroke={2}
                                          />
                                      ),
                                      onClick: () => setModalOpened(true),
                                      className: classes.createButton,
                                      disabled: viewMode,
                                      sideButtonProps: {
                                          disabled: viewMode,
                                          className: classes.sideButton,
                                      },
                                      menuButtonsProps: [
                                          {
                                              leftSection: (
                                                  <IconDevices2
                                                      size={16}
                                                      stroke={2}
                                                  />
                                              ),
                                              children: <>{tns("create-multiple")} </>,
                                              className: classes.menuButton,
                                              justify: "start",
                                          },
                                      ],
                                      menuProps: {
                                          classNames: {
                                              dropdown: classes.createMenuDropdown,
                                          },
                                          offset: 0,
                                      },
                                  },
                              },
                          ],
                }}
                RowComponent={Link}
                rowProps={(uuid) => ({ to: `/machines/${uuid}` })}
            />
        </>
    );
};

export default MachinesTable;
