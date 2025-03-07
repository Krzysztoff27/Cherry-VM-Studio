import { NativeSelect } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import useApi from "../../../../hooks/useApi.ts";
import ConfirmationModal from "../../../../modals/base/ConfirmationModal/ConfirmationModal.tsx";
import { SnapshotSelectProps } from "../../../../types/components.types.ts";

const VALUE_SEPERATOR = ':::';

export default function SnapshotSelect({ loadSnapshot, loadPreset, forceSnapshotDataUpdate } : SnapshotSelectProps) {
    const { t } = useTranslation();
    const { getRequest } = useApi();
    const [snapshotComponents, setSnapshotComponents] = useState([]);
    const [presetComponents, setPresetComponents] = useState([]);
    const [confirmationOpened, { open, close }] = useDisclosure(false);
    const selectedValue = useRef(null);

    const combineValues = (...values: string[]) => values.join(VALUE_SEPERATOR);

    const splitValues = (value: string) => value.split?.(VALUE_SEPERATOR);

    useEffect(() => {
        const setData = async () => {
            const snapshots = await getRequest('/network/snapshot/all');
            const presets = await getRequest('/network/preset/all');
            setSnapshotComponents(snapshots?.map((s, i) =>
                <option key={i} value={combineValues('snapshot', s.uuid)}> {s.name}</option>
            ) ?? []);
            setPresetComponents(presets?.map((p, i) =>
                <option key={i} value={combineValues('preset', p.uuid)}>&#xf023; &nbsp;{p.name}</option>
            ) ?? []);
        }
        setData();
    }, [forceSnapshotDataUpdate]);

    const onChange = (event: any) => {
        if (event.currentTarget.value === 'null') return;
        selectedValue.current = event.currentTarget.value;
        open();
    }

    const onModalCancel = () => {
        selectedValue.current = null;
        close();
    }

    const onModalConfirm = () => {
        const [type, uuid] = splitValues(selectedValue.current);

        if (type === 'preset') loadPreset(uuid);
        else if (type === 'snapshot') loadSnapshot(uuid);

        selectedValue.current = null;
        close();
    }

    return (
        <>
            <ConfirmationModal
                opened={confirmationOpened}
                onClose={onModalCancel}
                onConfirm={onModalConfirm}
                title={t('confirm.np-loading-config.title', {ns: 'modals'})}
                confirmButtonProps={{ color: 'red.7' }}
            />
            <NativeSelect
                onChange={onChange}
                value={`${selectedValue.current}`}
                radius={0}
                w={268}
            >
                <option value='null'>{t('network-panel.controls.load-config', {ns: 'pages'})}</option>
                <optgroup label={t('network-panel.controls.default-presets', {ns: 'pages'})}>
                    {...presetComponents}
                </optgroup>
                <optgroup label={t('network-panel.controls.saved-snapshots', {ns: 'pages'})}>
                    {...snapshotComponents}
                </optgroup>
            </NativeSelect>
        </>
    )
}
