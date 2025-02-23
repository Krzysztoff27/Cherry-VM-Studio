
const PERMISSIONS = {
    NONE:                       0,
    
    VIEW_OWN_MACHINES:          1 << 0,
    MANAGE_OWN_MACHINES:        1 << 1,
    VIEW_ALL_MACHINES:          1 << 2,
    MANAGE_ALL_MACHINES:        1 << 3,

    VIEW_USER_ACCOUNTS:         1 << 4,
    MANAGE_USER_ACCOUNTS:       1 << 5,
    VIEW_ADMIN_ACCOUNTS:        1 << 6,
    MANAGE_ADMIN_ACCOUNTS:      1 << 7,

    VIEW_OWN_USER_GROUPS:       1 << 8,
    MANAGE_OWN_USER_GROUPS:     1 << 9,
    CREATE_USER_GROUPS:         1 << 10,
    VIEW_ALL_USER_GROUPS:       1 << 11,
    MANAGE_ALL_USER_GROUPS:     1 << 12,
    GRANT_USER_GROUP_OWNERSHIP: 1 << 13,

    VIEW_OWN_VNETWORKS:         1 << 14,
    MANAGE_OWN_VNETWORKS:       1 << 15,
    VIEW_ALL_VNETWORKS:         1 << 16,
    MANAGE_ALL_VNETWORKS:       1 << 17,
}

export default PERMISSIONS;