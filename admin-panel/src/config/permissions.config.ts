
const PERMISSIONS = {
    NONE:                           0,
    
    VIEW_OWN_MACHINES:              1 << 0,
    MANAGE_OWN_MACHINES:            1 << 1,
    VIEW_ALL_MACHINES:              1 << 2,
    MANAGE_ALL_MACHINES:            1 << 3,

    VIEW_CLIENT_ACCOUNTS:           1 << 4,
    MANAGE_CLIENT_ACCOUNTS:         1 << 5,
    VIEW_ADMIN_ACCOUNTS:            1 << 6,
    MANAGE_ADMIN_ACCOUNTS:          1 << 7,

    VIEW_OWN_CLIENT_GROUPS:         1 << 8,
    MANAGE_OWN_CLIENT_GROUPS:       1 << 9,
    CREATE_CLIENT_GROUPS:           1 << 10,
    VIEW_ALL_CLIENT_GROUPS:         1 << 11,
    MANAGE_ALL_CLIENT_GROUPS:       1 << 12,
    GRANT_CLIENT_GROUP_OWNERSHIP:   1 << 13,

    VIEW_OWN_VNETWORKS:             1 << 14,
    MANAGE_OWN_VNETWORKS:           1 << 15,
    VIEW_ALL_VNETWORKS:             1 << 16,
    MANAGE_ALL_VNETWORKS:           1 << 17,
}

export default PERMISSIONS;