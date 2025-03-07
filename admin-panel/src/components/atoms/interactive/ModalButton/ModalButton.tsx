import { Button, Portal } from "@mantine/core";
import { ModalButtonProps } from "../../../../types/components.types";
import { useDisclosure } from "@mantine/hooks";

export default function ModalButton({ children, ModalComponent, ButtonComponent = Button, modalProps, onClick = () => null, ...buttonProps }: ModalButtonProps) {
    const [opened, {open, close}] = useDisclosure();

    const onButtonClick = () => {
        open();
        onClick();
    }

    return (
        <>
            <Portal>
                <ModalComponent opened={opened} onClose={close} {...modalProps}/>
            </Portal>
            <ButtonComponent onClick={onButtonClick} {...buttonProps}>
                {children}
            </ButtonComponent>
        </>
    )
}
