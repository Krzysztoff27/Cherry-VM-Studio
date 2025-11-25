import { IconBrandGithub } from "@tabler/icons-react";
import { Contributor } from "../types/config.types";

export const projectLinks = {
    github: "https://github.com/Krzysztoff27/Cherry-VM-Studio",
    documentation: "https://github.com/Krzysztoff27/Cherry-VM-Studio/wiki",
};

export const contributors: Contributor[] = [
    {
        name: "Krzysztof Kolasiński",
        avatar: "https://github.com/Krzysztoff27.png",
        socials: [{ name: "Github", url: "https://github.com/Krzysztoff27", icon: IconBrandGithub }],
        contributions: [],
    },
    {
        name: "Tomasz Kośla",
        avatar: "https://github.com/Th3TK.png",
        socials: [{ name: "Github", url: "https://github.com/Th3TK", icon: IconBrandGithub }],
        contributions: ["User Interface and User Experience Design", "Developing Cherry Admin Panel", "Developing Cherry API middleware"],
    },
];
