import { IconX, IconCheck } from "@tabler/icons-react";
import { Text, Box } from "@mantine/core";

const PasswordRequirement = ({ meets, label }: { meets: boolean; label: string }) => {
    return (
        <Text
            c={meets ? "teal" : "red"}
            style={{ display: "flex", alignItems: "center" }}
            mt={7}
            size="sm"
        >
            {meets ? <IconCheck size={14} /> : <IconX size={14} />}
            <Box ml={10}>{label}</Box>
        </Text>
    );
};

export default PasswordRequirement;
