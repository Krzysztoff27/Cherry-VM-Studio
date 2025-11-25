import { Stack } from "@mantine/core";
import { IconBook2, IconBrandGithub, IconLogout } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import useNamespaceTranslation from "../../../../hooks/useNamespaceTranslation.ts";
import LanguageSwitch from "../../interactive/LanguageSwitch/LanguageSwitch.jsx";
import TooltipIconButton from "../../interactive/TooltipIconButton/TooltipNavButton.tsx";
import classes from "./Navbar.module.css";
import { useAuthentication } from "../../../../contexts/AuthenticationContext.tsx";
import { Page } from "../../../../types/config.types.ts";
import NavButton from "../../../atoms/interactive/NavButton/NavButton.tsx";
import { projectLinks } from "../../../../config/project.config.ts";

export interface NavbarProps {
    pages: Page[];
}

export default function Navbar({ pages }: NavbarProps): React.ReactElement {
    const { t, tns } = useNamespaceTranslation("layouts");
    const { logout } = useAuthentication();
    const navigate = useNavigate();
    const location = useLocation();
    const [active, setActive] = useState<number>();

    useEffect(() => setActive(pages.findIndex((cat) => location.pathname.startsWith(cat.path))), [location.pathname]);

    const onClickLogout = () => {
        logout();
        navigate("/");
    };

    return (
        <Stack className={classes.navbar}>
            <Stack gap="md">
                {pages.map((category, i) => (
                    <TooltipIconButton
                        key={i}
                        component={Link}
                        to={category.path}
                        active={active === i}
                        label={tns(`navbar.${category.key}`)}
                        icon={<category.icon stroke={1.5} />}
                        disabled={category.disabled}
                    />
                ))}
            </Stack>
            <Stack>
                <NavButton
                    component="a"
                    href={projectLinks.documentation}
                    icon={<IconBook2 />}
                />
                <NavButton
                    component="a"
                    href={projectLinks.github}
                    icon={<IconBrandGithub />}
                />
                <LanguageSwitch />
                <TooltipIconButton
                    onClick={onClickLogout}
                    label={t("log-out")}
                    icon={<IconLogout stroke={1.5} />}
                />
            </Stack>
        </Stack>
    );
}
