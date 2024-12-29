import { Contributors, Credits } from "../types/config.types"

export const projectLinks = {
    github: 'https://github.com/Krzysztoff27/Cherry-VM-Manager',
    documentation: 'https://krzysztof27.notion.site/2d330eb559bb47c589e01315a893b273?v=59ebf2e040284f42ae6c09e649be2e6c'
}

const contributors: Contributors = {
    Krzysztoff27: {
        name: 'Krzysztof Kolasiński',
        avatar: 'https://github.com/Krzysztoff27.png',
        url: 'https://github.com/Krzysztoff27',
    },
    Th3TK: {
        name: 'Tomasz Kośla',
        avatar: 'https://github.com/Th3TK.png',
        url: 'https://github.com/Th3TK'
    },
    Tux10: {
        name: 'Tux 10',
        avatar: '/icons/Tux.webp',
        url: 'dobre'
    },
    Majs0n: {
        name: 'Maja Cegłowska',
        avatar: ''
    }
}

export const credits: Credits = [
    {
        key: 'instalation-scripts',
        contributors: [contributors.Krzysztoff27]
    },
    {
        key: 'guacamole',
        contributors: [contributors.Krzysztoff27]
    },
    {
        key: 'virtualization',
        contributors: [contributors.Krzysztoff27]
    },
    {
        key: 'cherry-proxy',
        contributors: [contributors.Krzysztoff27]
    },
    {
        key: 'cherry-api',
        contributors: [contributors.Th3TK, contributors.Tux10]
    },
    {
        key: 'cherry-admin-panel',
        contributors: [contributors.Th3TK]
    },
    {
        key: 'connectivity',
        contributors: [contributors.Th3TK]
    },
    {
        key: 'project-logo',
        contributors: [contributors.Th3TK, contributors.Majs0n]
    },
]