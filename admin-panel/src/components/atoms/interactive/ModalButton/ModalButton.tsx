import { Button } from "@mantine/core";
import { ModalButtonProps } from "../../../../types/components.types";
import { useDisclosure } from "@mantine/hooks";

export default function ModalButton({ children, Modal, modalProps, ...props }: ModalButtonProps) {
    const [opened, {open, close}] = useDisclosure();

    return (
        <>
            <Modal opened={opened} close={close} {...modalProps}/>
            <Button onClick={open} {...props}>{children}</Button>
        </>
    )
}
