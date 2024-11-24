#!/usr/bin/env bash
if [[ $# -lt 4 ]]; then
    printf "Usage: %s <VITE_API_BASE_URL> <VITE_API_WEBSOCKET_URL> <VITE_TRAEFIK_PANEL_URL> <VITE_GUACAMOLE_PANEL_URL>" "$0"
    exit 1
fi

VITE_API_BASE_URL=$1
VITE_API_WEBSOCKET_URL=$2
VITE_TRAEFIK_PANEL_URL=$3
VITE_GUACAMOLE_PANEL_URL=$4

docker build \
    -f docker/dockerfile \
    --build-arg VITE_API_BASE_URL="$VITE_API_BASE_URL" \
    --build-arg VITE_API_WEBSOCKET_URL="$VITE_API_WEBSOCKET_URL" \
    --build-arg VITE_TRAEFIK_PANEL_URL="$VITE_TRAEFIK_PANEL_URL" \
    --build-arg VITE_GUACAMOLE_PANEL_URL="$VITE_GUACAMOLE_PANEL_URL" \
    -t cherry-admin-panel .