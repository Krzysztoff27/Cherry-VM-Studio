export interface UrlNode {
    api_requests: string;
    api_websockets: string;
    traefik?: string;
    guacamole?: string; 
}

export interface UrlConfig { 
    production: UrlNode;
    development: UrlNode;
    staging?: UrlNode;
}

interface Contributor {
    name: string;
    avatar: string;
    url?: string;
}

export interface Contributors {
    [key: string]: Contributor;
}

interface Credit {
    key: string; // language key
    contributors: Contributor[];
}

export type Credits = Credit[];