export default [
    {
        path: 'VITE_API_BASE_URL',
        regex: /^https?:\/\/[\w\-.~!*'();:@&=+$,/?%#\[\]]*(%[0-9a-fA-F]{2})*(:\d{2,5})?$/,
    },
    {
        path: 'VITE_API_WEBSOCKET_URL',
        regex: /^wss?:\/\/[\w\-.~!*'();:@&=+$,/?%#\[\]]*(%[0-9a-fA-F]{2})*(:\d{2,5})?$/,
    },
    {
        path: 'VITE_TRAEFIK_PANEL_URL',
        regex: /^https?:\/\/[\w\-.~!*'();:@&=+$,/?%#\[\]]*(%[0-9a-fA-F]{2})*(:\d{2,5})?$/,
        optional: true,

    },
    {
        path: 'VITE_GUACAMOLE_PANEL_URL',
        regex: /^https?:\/\/[\w\-.~!*'();:@&=+$,/?%#\[\]]*(%[0-9a-fA-F]{2})*(:\d{2,5})?$/,
        optional: true,
    }
]