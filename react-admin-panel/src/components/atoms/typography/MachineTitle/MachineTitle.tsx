import { Title } from '@mantine/core'
import { MachineTitleProps } from '../../../../types/atoms.types'
import { useTranslation } from 'react-i18next'


const MachineTitle = ({machine, ...props}: MachineTitleProps) => {
    const { t } = useTranslation();
    if(!machine) return;

    return (
        <Title {...props} tt='capitalize'>
            {t(machine.group)} {machine.group_member_id}
        </Title>
    )
}

export default MachineTitle