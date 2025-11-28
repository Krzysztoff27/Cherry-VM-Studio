import { Group, Indicator, Loader, ScrollArea, SimpleGrid, Stack, Text } from "@mantine/core";
import { useElementSize } from "@mantine/hooks";
import { round, values } from "lodash";
import classes from "./MachinesGrid.module.css";
import MachineCard from "../../../atoms/display/MachineCard/MachineCard";
import { MachineState } from "../../../../types/api.types";
import { AxiosError } from "axios";
import { useTranslation } from "react-i18next";
import { IconDeviceDesktop } from "@tabler/icons-react";

export interface MachinesGridProps {
    machines: Record<string, MachineState>;
    loading: boolean;
    error: AxiosError | null;
    rows?: number;
}

const MachinesGrid = ({ machines, loading, rows = Infinity }: MachinesGridProps): React.JSX.Element => {
    const { width, ref } = useElementSize();
    const { t } = useTranslation();

    const cols = round(width / 420);
    const filteredMachines = values(machines)?.slice(0, cols * rows);

    return (
        <ScrollArea
            ref={ref}
            scrollbars="y"
            offsetScrollbars
            scrollbarSize="0.525rem"
            className={classes.scrollArea}
            classNames={{ content: "auto-width" }}
        >
            {loading ? (
                <Stack className={classes.loaderContainer}>
                    <IconDeviceDesktop size={48} />
                    <Group gap="xs">
                        <Text fw="500">{t("loading-machines")}</Text>
                        <Loader
                            type="dots"
                            color="white"
                            size="24"
                        />
                    </Group>
                </Stack>
            ) : (
                <SimpleGrid cols={cols}>
                    {filteredMachines.map((machine, i) => (
                        <MachineCard
                            key={i}
                            machine={machine}
                        />
                    ))}
                </SimpleGrid>
            )}
        </ScrollArea>
    );
};

export default MachinesGrid;
