import { Button } from "@mantine/core";
import { ModalButtonProps } from "../../../../types/components.types";
import { useDisclosure } from "@mantine/hooks";

export default function ModalButton({ children, ModalComponent, ButtonComponent = Button, modalProps, ...buttonProps }: ModalButtonProps) {
    const [opened, {open, close}] = useDisclosure();

    return (
        <>
            <ModalComponent opened={opened} onClose={close} {...modalProps}/>
            <ButtonComponent onClick={open} {...buttonProps}>
                {children}
            </ButtonComponent>
        </>
    )
}
