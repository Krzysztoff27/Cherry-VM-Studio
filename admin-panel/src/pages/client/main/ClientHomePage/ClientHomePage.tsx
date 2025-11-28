import { Badge, Button, Group, Image, Paper, Stack, Text, Title } from "@mantine/core";
import classes from "./ClientHomePage.module.css";
import useNamespaceTranslation from "../../../../hooks/useNamespaceTranslation";
import { getFullUserName } from "../../../../utils/users";
import { isNull, keys, values } from "lodash";
import { User } from "../../../../types/api.types";
import ClientMachinesPage from "../../machines/ClientMachinesPage/ClientMachinesPage";
import { IconExternalLink } from "@tabler/icons-react";
import { useNavigate } from "react-router-dom";
import GreetingTitle from "../../../../components/atoms/display/GreetingTitle/GreetingTitle";
import MachinesGrid from "../../../../components/molecules/display/MachinesGrid/MachinesGrid";
import useMachineState from "../../../../hooks/useMachineState";
import useMantineNotifications from "../../../../hooks/useMantineNotifications";
import { ERRORS } from "../../../../config/errors.config";
import BusinessCard from "../../../../components/atoms/display/BusinessCard/BusinessCard";
import useFetch from "../../../../hooks/useFetch";
import BadgeGroup from "../../../../components/atoms/display/BadgeGroup/BadgeGroup";
import { formatDate } from "../../../../utils/dates";
import ProfileOverview from "../../../../components/organisms/display/ProfileOverview/ProfileOverview";
import MachinesOverview from "../../../../components/organisms/display/MachinesOverview/MachinesOverview";

const ClientHomePage = (): React.JSX.Element => {
    const { t, tns } = useNamespaceTranslation("pages", "client-home");

    return (
        <Stack className={classes.container}>
            <Group
                mb="auto"
                w="100%"
                gap="xl"
                // justify="space-between"
            >
                <Image
                    src="/icons/Cherry VM Studio Logo Small.webp"
                    w="100px"
                />
                <Stack>
                    <GreetingTitle />
                    <Text className={classes.description}>{tns("description1")}</Text>
                </Stack>
            </Group>
            <ProfileOverview />
            <MachinesOverview />
        </Stack>
    );
};

export default ClientHomePage;
