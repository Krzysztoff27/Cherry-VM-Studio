import { Button, Group, Modal, PasswordInput, Stack } from "@mantine/core";
import { matchesField, useForm } from "@mantine/form";

const ChangePasswordModal = ({ opened, onClose }) => {
    const form = useForm({
        mode: "uncontrolled",
        initialValues: {
            password: "",
            confirmPassword: "",
        },

        validate: {
            confirmPassword: matchesField("password", "Passwords are not the same"),
        },
    });

    const closeModal = () => {
        form.reset();
        onClose();
    };

    const onSubmit = form.onSubmit(values => {
        closeModal();
    });

    return (
        <Modal
            opened={opened}
            onClose={onClose}
            title="Change Password"
        >
            <form onSubmit={onSubmit}>
                <Stack gap="sm">
                    <PasswordInput
                        label="Enter the new password"
                        placeholder="Password"
                        styles={{
                            input: {
                                fontWeight: "500",
                                color: "var(--mantine-color-dimmed)",
                                border: "none",
                            },
                            innerInput: {
                                padding: "16px",
                            },
                        }}
                        key={form.key("password")}
                        {...form.getInputProps("password")}
                        withAsterisk
                    />
                    <PasswordInput
                        label="Confirm the new password"
                        placeholder="Confirm password"
                        styles={{
                            input: {
                                fontWeight: "500",
                                color: "var(--mantine-color-dimmed)",
                                border: "none",
                            },
                            innerInput: {
                                padding: "16px",
                            },
                        }}
                        key={form.key("confirmPassword")}
                        {...form.getInputProps("confirmPassword")}
                        withAsterisk
                    />
                    <Group>
                        <Button
                            variant="default"
                            bd="none"
                            onClick={closeModal}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="white"
                            c="black"
                            type="submit"
                        >
                            Submit
                        </Button>
                    </Group>
                </Stack>
            </form>
        </Modal>
    );
};

export default ChangePasswordModal;
