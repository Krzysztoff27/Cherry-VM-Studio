import { ActionIcon } from '@mantine/core';
import React from 'react'
import classes from "./NavButton.module.css";
import { NavButtonProps } from '../../../../types/components.types';

export const NavButton = React.forwardRef<HTMLButtonElement, NavButtonProps>(
    ({ icon, label, active = false, ...props } : NavButtonProps, ref) => {
        return (
            <ActionIcon
                {...props}
                ref={ref}
                variant='filled'
                className={classes.actionIcon}
                disabled={active}
                size='xl'
                aria-label={label}
            >
                {icon}
            </ActionIcon>
        )
    }
);

export default NavButton;
