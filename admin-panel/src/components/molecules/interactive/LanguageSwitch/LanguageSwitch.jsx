import { useTranslation } from "react-i18next";
import classes from "./LanguageSwitch.module.css";
import { ActionIcon, Popover, Radio, Stack } from "@mantine/core";
import { IconLanguage } from "@tabler/icons-react";

export default function LanguageSwitch({ position = "right" }) {
    const { t, i18n } = useTranslation();

    return (
        <Popover trapFocus offset={5} position={position} withArrow>
            <Popover.Target>
                <ActionIcon
                    variant='filled'
                    className={classes.actionIcon}
                    size='xl'
                    aria-label={t('switch-language')}
                >
                    <IconLanguage stroke={2} />
                </ActionIcon>
            </Popover.Target>
            <Popover.Dropdown className={classes.radioMenu}>
                <Radio.Group
                    value={i18n.language.substring(0, 2).toLowerCase()}
                    onChange={(val) => i18n.changeLanguage(val)}
                >
                    <Stack>
                        <Radio value="en" label={'English'} />
                        <Radio value="pl" label={'Polski'} />
                    </Stack>
                </Radio.Group>
            </Popover.Dropdown>
        </Popover>
    )
}
