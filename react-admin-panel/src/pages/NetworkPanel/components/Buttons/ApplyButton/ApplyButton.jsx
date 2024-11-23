import { Button } from "@mantine/core";
import classes from './ApplyButton.module.css';
import { useTranslation } from "react-i18next";

export default function ApplyButton({applyNetworkConfig = () => {}, isDirty}) {
    const { t } = useTranslation();

    return (
        <Button
            onClick={applyNetworkConfig}
            disabled={!isDirty}
            classNames={{
                root: isDirty === null ? null : classes.saveButton,
                label: classes.saveButtonLabel
            }}
            variant='default'
            w={isDirty ? 100 : 200}
            p={0}
        >
            {t(`network-panel.controls.${isDirty === null ? 'no-changes' : 
                isDirty ? 'save' : 'changes-saved'}`, {ns: 'pages'})}
        </Button>
    )
}
