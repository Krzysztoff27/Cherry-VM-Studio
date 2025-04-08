import { TablerIcon } from "@tabler/icons-react";
import { ComponentType } from "react";

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

interface Social {
    name: string;
    url: string;
    icon: ComponentType<any>;
}

export interface Contributor {
    name: string;
    avatar: string;
    socials?: Social[];
    contributions?: string[];
}

export interface Page {
    key: string;
    path: string;
    icon: TablerIcon;
    subpages?: Page[];
}

export type AccountType = "administrative" | "client";
