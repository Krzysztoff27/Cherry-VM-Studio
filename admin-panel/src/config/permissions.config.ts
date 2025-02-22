
const PERMISSIONS = {
    NONE:                   0,
    CREATE_MACHINES:        1 << 0, // can create own virtual machines, manage their settings, as well as connections between them.
                                    // can assign session accounts it has ownership of to created machines

    ADMINISTRATE_MACHINES:  1 << 1, // can manage all virtual machines 
    ADMINISTRATE_VNETWORKS: 1 << 2, // can manage all virtual networks
    ADMINISTRATE_USERS:     1 << 3, // can create new session accounts, and administrative accounts with permissions limited to one's own roles
    ADMINISTRATE_GROUPS:    1 << 4, // can group session accounts and grant ownership of such groups to other administrative accounts 
}

export default PERMISSIONS;