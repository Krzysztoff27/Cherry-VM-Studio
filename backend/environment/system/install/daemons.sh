#!/usr/bin/env bash

set_config_param() {
    local param="$1"
    local value="$2"
    local file="$3"
    if grep -q "^[^#]*$param" "$file"; then
        # If the parameter exists, replace its value
        sudo sed -i "s/^[^#]*$param.*/$param=\"$value\"/" "$file"
    else
        # If the parameter does not exist, append it to the end of the file
        echo "$param=\"$value\"" | sudo tee -a "$file" > /dev/null
    fi
}

configure_daemon_libvirt(){
    printf '[i] Making backup of libvirt daemon config file: '
    runuser -u CherryWorker -- cp "$LIBVIRTD_CONFIG_FILE" "${LIBVIRTD_CONFIG_FILE}.bak"
    ok_handler
    printf '[i] Modifying libvirt monolithic daemon config: '
    runuser -u CherryWorker -- set_config_param 'listen_tls' 1 "${LIBVIRTD_CONFIG_FILE}"
    runuser -u CherryWorker -- set_config_param 'listen_tcp' 0 "${LIBVIRTD_CONFIG_FILE}"
    runuser -u CherryWorker -- set_config_param 'tls_port' '16514' "${LIBVIRTD_CONFIG_FILE}"
    runuser -u CherryWorker -- set_config_param 'listen_addr' '10.10.10.254' "${LIBVIRTD_CONFIG_FILE}"
    runuser -u CherryWorker -- set_config_param 'auth_tls' "none" "${LIBVIRTD_CONFIG_FILE}"
    ok_handler
    printf '[i] Installing libvirt TLS socket override file: '
    runuser -u CherryWorker -- touch '/etc/systemd/system/libvirtd-tls.socket.d/override.conf'
    override_lines=('[Socket]' 'ListenStream=' 'ListenStream=10.10.10.254:16514')
    printf '%s\n' "${override_lines[@]}" > '/etc/systemd/system/libvirtd-tls.socket.d/override.conf'
    ok_handler
    printf '[i] Enabling libvirt monolithic daemon and TLS socket to run on startup: '
    runuser -u CherryWorker -- sudo systemctl -q stop libvirtd.service
    runuser -u CherryWorker -- sudo systemctl -q enable --now libvirtd-tls.socket
    runuser -u CherryWorker -- sudo systemctl -q enable libvirtd.service
    ok_handler
    printf '[i] Starting libvirt TLS socket: '
    runsuer -u CherryWorker -- sudo systemctl -q start libvirtd-tls.socket
    ok_handler
    printf '[i] Starting libvirt monolithic daemon: '
    runuser -u CherryWorker -- sudo systemctl -q start libvirtd.service 
    ok_handler
    printf "[i] Creating directory structure ($DIR_LIBVIRT) and copying vm infrastructure .xml files: "
    runuser -u CherryWorker -- mkdir -p "$DIR_LIBVIRT"
    runuser -u CherryWorker -- cp -r ../libvirt/. "$DIR_LIBVIRT"
    ok_handler
    printf "[i] Creating directory structure ($VM_INSTANCES): "
    runuser -u CherryWorker -- mkdir -p "$VM_INSTANCES"
    ok_handler
}

configure_daemon_docker(){
    printf '\n[i] Enabling docker daemon to run on startup: '
    systemctl -q enable docker.service 
    ok_handler
    printf '[i] Starting docker daemon: '
    systemctl -q start docker.service 
    ok_handler
    printf "[i] Creating directory structure ("${DIR_DOCKER}") and copying docker files: "
    mkdir -p "$DIR_DOCKER"
    cp -r ../docker/. "$DIR_DOCKER"
    ok_handler
    #Add copying of the files from api/docker and react-admin-panel/docker after building their images
    printf '[i] Copying docker files for Cherry API: '
    mkdir -p "${DIR_DOCKER}cherry-api"
    cp -r '../../api/api/docker/.' "${DIR_DOCKER}cherry-api"
    ok_handler
    printf '[i] Copying Cherry Admin Panel files for image build: '
    mkdir -p "${DIR_IMAGE_FILES}cherry-admin-panel"
    cp -r '../../react-admin-panel/react-admin-panel/.' "${DIR_IMAGE_FILES}cherry-admin-panel"
    ok_handler
    printf '[i] Copying docker files for Cherry Admin Panel: '
    mkdir -p "${DIR_DOCKER}cherry-admin-panel"
    cp -r '../../react-admin-panel/react-admin-panel/docker/.' "${DIR_DOCKER}cherry-admin-panel"
    ok_handler
}

