CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE administrators (
    uuid UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(24) UNIQUE NOT NULL,
    password VARCHAR(60) NOT NULL,
    name VARCHAR(50),
    surname VARCHAR(50),
    email VARCHAR(255) UNIQUE,
    creation_date DATE NOT NULL DEFAULT current_date,
    last_active TIMESTAMP,
    disabled BOOLEAN DEFAULT FALSE
);

CREATE TABLE clients (
    uuid UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(24) UNIQUE NOT NULL,
    password VARCHAR(60) NOT NULL,
    name VARCHAR(50),
    surname VARCHAR(50),
    email VARCHAR(255) UNIQUE,
    creation_date DATE NOT NULL DEFAULT current_date,
    last_active TIMESTAMP,
    disabled BOOLEAN DEFAULT FALSE
);

CREATE TABLE roles (
    uuid UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) UNIQUE,
    permissions INT DEFAULT 0
);

CREATE TABLE groups (
    uuid UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) UNIQUE
);

CREATE TABLE administrators_roles (
    administrator_uuid UUID,
    role_uuid UUID,
    PRIMARY KEY(administrator_uuid, role_uuid),
    FOREIGN KEY(administrator_uuid) REFERENCES administrators(uuid) ON DELETE CASCADE,
    FOREIGN KEY(role_uuid) REFERENCES roles(uuid) ON DELETE CASCADE
);

CREATE TABLE clients_groups (
    client_uuid UUID,
    group_uuid UUID,
    PRIMARY KEY(client_uuid, group_uuid),
    FOREIGN KEY(client_uuid) REFERENCES clients(uuid) ON DELETE CASCADE,
    FOREIGN KEY(group_uuid) REFERENCES groups(uuid) ON DELETE CASCADE
);

CREATE TABLE deployed_machines_owners (
    machine_uuid UUID PRIMARY KEY,
    owner_uuid UUID,
    FOREIGN KEY(owner_uuid) REFERENCES administrators(uuid) ON DELETE CASCADE
);

CREATE TABLE deployed_machines_clients (
    machine_uuid UUID,
    client_uuid UUID,
    PRIMARY KEY(machine_uuid, client_uuid),
    FOREIGN KEY(client_uuid) REFERENCES clients(uuid) ON DELETE CASCADE
);

CREATE TABLE network_panel_states (
	owner_uuid UUID PRIMARY KEY,
	positions JSONB NOT NULL,
	FOREIGN KEY(owner_uuid) REFERENCES administrators(uuid) ON DELETE CASCADE
);

CREATE TABLE network_snapshots (
	uuid UUID PRIMARY KEY DEFAULT gen_random_uuid(),
	owner_uuid UUID,
	name VARCHAR(24) UNIQUE NOT NULL,
	created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    intnets JSONB NOT NULL,
	positions JSONB NOT NULL,
	FOREIGN KEY(owner_uuid) REFERENCES administrators(uuid) ON DELETE CASCADE
);

CREATE TABLE machine_snapshots (
    uuid UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_uuid UUID,
    name VARCHAR(24) UNIQUE NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    size BIGINT DEFAULT 0,
    FOREIGN KEY(owner_uuid) REFERENCES administrators(uuid) ON DELETE CASCADE
);

CREATE TABLE machine_snapshots_shares (
    snapshot_uuid UUID,
    recipient_uuid UUID,
    PRIMARY KEY(snapshot_uuid, recipient_uuid),
    FOREIGN KEY(snapshot_uuid) REFERENCES machine_snapshots(uuid) ON DELETE CASCADE
    FOREIGN KEY(recipient_uuid) REFERENCES administrators(uuid) ON DELETE CASCADE
);

-- Virtual Machine object representation as tables of PGSQL composite types

-- Metadata
CREATE TYPE machine_metadata AS (
    tag VARCHAR(255) NOT NULL,
    value VARCHAR(255) NOT NULL
);

CREATE TYPE group_metadata AS (
    tag VARCHAR(255) NOT NULL,
    value VARCHAR(255) NOT NULL
);

CREATE TYPE group_member_id_metadata AS (
    tag VARCHAR(255) NOT NULL,
    value VARCHAR(255) NOT NULL 
);

-- Wrapper functions for setting tags of restricted "tag" value
CREATE FUNCTION group_metadata(value VARCHAR)
RETURNS group_metadata LANGUAGE sql IMMUTABLE AS $$
    SELECT ROW('group', value)::group_metadata;
$$;

CREATE FUNCTION group_member_id_metadata(value VARCHAR)
RETURNS group_member_id_metadata LANGUAGE sql IMMUTABLE AS $$
    SELECT ROW('groupMemberId', value)::group_member_id_metadata;
$$;

CREATE FUNCTION additional_metadata(tag VARCHAR, value VARCHAR)
RETURNS additional_metadata LANGUAGE sql IMMUTABLE AS $$
    SELECT ROW(tag, value)::machine_metadata;
$$;

-- Machine disks
CREATE TYPE disk_type AS ENUM ("raw", "qcow2", "qed", "qcow", "luks", "vdi", "vmdk", "vpc", "vhdx");

CREATE TYPE machine_disk AS (
    name VARCHAR(255) NOT NULL,
    filepath VARCHAR(255) NOT NULL,
    size INT NOT NULL,
    type disk_type
);

-- Machine Network Interfaces
CREATE TYPE machine_network_interfaces AS (
    name VARCHAR(255) NOT NULL
);

-- Machine Parameters
CREATE TABLE machine_templates (
    uuid UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,

    -- required metadata fields
    group_metadata group_metadata NOT NULL,
    group_member_id_metadata group_member_id_metadata, -- this one can be NULL as it is most commonly set during machine runtime

    -- optional list of arbitrary metadata
    additional_metadata machine_metadata[],

    ram INT NOT NULL CHECK (ram > 0),
    vcpu INT NOT NULL CHECK (vcpu > 0),
    os_type VARCHAR(255),

    disks machine_disk[] NOT NULL,

    username VARCHAR(255),
    password VARCHAR(255),

    network_interfaces network_interface[]

    -- constraints to enforce tag correctness
    CONSTRAINT group_metadata_tag_check
        CHECK ((group_metadata).tag = 'group')

    CONSTRAINT group_member_id_tag_check
        CHECK ((group_member_id_metadata).tag = 'groupMemberId')
);

CREATE INDEX administrators_idx ON administrators (uuid, username, email);
CREATE INDEX clients_idx ON clients (uuid, username, email);
CREATE INDEX roles_idx ON roles (uuid);
CREATE INDEX groups_idx ON groups (uuid);
CREATE INDEX administrators_roles_idx ON administrators_roles (administrator_uuid, role_uuid);
CREATE INDEX clients_groups_idx ON clients_groups (client_uuid, group_uuid);
CREATE INDEX deployed_machines_owner_idx ON deployed_machines_owners(machine_uuid, owner_uuid);
CREATE INDEX deployed_machines_clients_idx ON deployed_machines_clients(machine_uuid, client_uuid);
CREATE INDEX network_panel_states_idx ON network_panel_states(owner_uuid);
CREATE INDEX network_snapshots_idx ON network_snapshots(uuid, owner_uuid);
CREATE INDEX machine_snapshots_idx ON machine_snapshots(uuid, owner_uuid);
CREATE INDEX machine_snapshots_shares_idx ON machine_snapshots_shares(snapshot_uuid, recipient_uuid);
CREATE INDEX machine_templates_uuid_idx ON machine_templates (uuid);
CREATE INDEX machine_templates_name_idx ON machine_templates (name);
CREATE INDEX machine_templates_group_value_idx ON machine_templates ((group_metadata).value);
CREATE INDEX machine_templates_group_member_id_idx ON machine_templates ((group_member_id_metadata).value);
CREATE INDEX machine_templates_additional_metadata_idx ON machine_templates USING GIN (additional_metadata);

-- Insert roles
INSERT INTO roles (name, permissions)
VALUES 
    ('Machine Observer', 1),
    ('Machine Manager', 3),
    ('Client Accounts Manager', 4),
    ('Administrative Accounts Manager', 8),
    ('Accounts Manager', 12),
    ('Client Credentials Manager', 16),
    ('Administrative Credentials Manager', 32),
    ('Credentials Manager', 48);

-- Insert root administrator
INSERT INTO administrators (uuid, username, password)
VALUES 
    ('83212b1e-b222-4bba-a1d4-450e08cbbeb1', 'root', '$2b$12$GNkVdiV24DIhBWYssz0H9.22nhoI1EuT9TNXRpwUHOCRKyKa7.wfS');

-- Assign roles to root administrator
INSERT INTO administrators_roles (administrator_uuid, role_uuid)
SELECT 
    '83212b1e-b222-4bba-a1d4-450e08cbbeb1',
    uuid
FROM roles
WHERE name IN ('Machine Manager', 'Accounts Manager', 'Credentials Manager');

