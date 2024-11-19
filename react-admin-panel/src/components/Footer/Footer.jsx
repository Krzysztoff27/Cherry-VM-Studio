import { Group, rem, SimpleGrid, Text } from "@mantine/core";
import { Link } from "react-router-dom";

export default function Footer() {
    return (
        <Group w='100%' justify='center'>
            <SimpleGrid w={rem(900)} cols={4} ta='center' c='dimmed'>
                <Text component={Link} to='/'>Home</Text>
                <Text component={Link}>Documentation</Text>
                <Text component={Link} to='/credits'>Credits</Text>
                <Text component={Link} to='/copyright'>Copyright</Text>
            </SimpleGrid>
        </Group>
    )
}
