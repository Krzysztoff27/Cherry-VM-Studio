import { Card, Group, Title } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { MachineCardProps } from '../../../types/organisms.types';
import ConnectButton from '../../atoms/interactive/ConnectButton/ConnectButton';
import MachineConnectionDetails from '../../molecules/display/MachineConnectionDetails/MachineConnectionDetails';
import ActivitySparkline from '../ActivitySparkline/ActivitySparkline';
import classes from './MachineCard.module.css';

/**
 * Renders a card component representing a virtual machine with its relevant information and controls.
 * The card includes an activity sparkline, machine group and ID, domain and port information, and
 * a 'Connect' button that opens the machine's domain in a new tab if the machine is active.
 */
export default function MachineCard({ machine, to, currentState } : MachineCardProps) : React.JSX.Element {
    const { t } = useTranslation();
    const navigate = useNavigate();

    const handleCardClick = () => navigate(to)

    const handleButtonClick = (event) => {
        event.stopPropagation(); // Prevents the card click event
        if (currentState.active) window.open(`http://${machine.domain}`, '_blank');
    };

    return (
        <Card shadow='sm' onClick={handleCardClick} className={classes.card}>
            <Card.Section>
                <ActivitySparkline currentState={currentState} />
            </Card.Section>

            <Title order={4} tt='capitalize' mt='6' mb='xs'>
                {t(machine.group)} {machine.group_member_id}
            </Title>

            <MachineConnectionDetails 
                active={currentState?.active} 
                machine={machine}
            />
            
            <ConnectButton 
                active={currentState?.active} 
                label={t('machine-list.cards.connect', {ns: 'pages'})}
                onClick={handleButtonClick}
            />
        </Card>
    );
}

