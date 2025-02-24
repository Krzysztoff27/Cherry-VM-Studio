import libvirt
import libvirt.filters

uri = 'qemu+tls://10.10.10.254/system'

api_key = '/etc/pki/libvirt/private/cherry-api_client_key.pem'
api_cert = '/etc/pki/libvirt/cherry-api_client_certificate.pem'
ca_cert = '/usr/local/share/ca-certificates/certificate_authority_certificate.pem'

try:
    conn = libvirt.openAuth(
        uri,
        [libvirt.VIR_CRED_AUTHNAME, libvirt.VIR_CRED_NOECHOPROMPT],
        [[libvirt.VIR_CRED_TYPE_TLS, api_key, api_cert, ca_cert]]
    )

except libvirt.libvirtError as e:
    print(f"Failed to connect to libvirt: {e}")