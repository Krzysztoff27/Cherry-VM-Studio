import { UrlConfig, UrlNode } from "../types/config.types";

const config: UrlConfig = {
    production: {
        api_requests: `http://${window.location.hostname}/api`,
        api_websockets: `ws://${window.location.hostname}/api`,
        guacamole: `http://${window.location.hostname}/guacamole`,
        traefik: `http://traefik.${window.location.hostname}/dashboard`,
    },
    development: {
        api_requests: `http://lenovo.lab/api`,
        api_websockets: `ws://lenovo.lab/api`,
    },
};

const mode = import.meta.env.MODE;

export default (config[mode] || config.development) as UrlNode;
