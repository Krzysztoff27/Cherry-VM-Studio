CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE administrators (
    uuid UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(24) UNIQUE NOT NULL,
    password VARCHAR(60),
    name VARCHAR(50),
    surname VARCHAR(50),
    email VARCHAR(255) UNIQUE
    creation_date DATE NOT NULL DEFAULT current_date,
    last_active TIMESTAMP,
    disabled BOOLEAN DEFAULT 0
);

CREATE TABLE clients (
    uuid UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(24) UNIQUE NOT NULL,
    password VARCHAR(60),
    name VARCHAR(50),
    surname VARCHAR(50),
    email VARCHAR(255) UNIQUE,
    creation_date DATE NOT NULL DEFAULT current_date,
    last_active TIMESTAMP,
    disabled BOOLEAN DEFAULT 0
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

CREATE TABLE deployed_machines (
    uuid UUID PRIMARY KEY,
    group VARCHAR(24),
    group_member_id INT,
    owner_uuid UUID,
    port INT,
    domain VARCHAR(255),
    FOREIGN KEY(owner_uuid) REFERENCES administrators(owner_uuid) ON DELETE CASCADE
);

CREATE TABLE machines_clients (
    machine_uuid UUID,
    client_uuid UUID,
    PRIMARY KEY(machine_uuid, client_uuid),
    FOREIGN KEY(machine_uuid) REFERENCES deployed_machines(uuid) ON DELETE CASCADE,
    FOREIGN KEY(client_uuid) REFERENCES clients(uuid) ON DELETE CASCADE
);

CREATE INDEX administrators_idx ON administrators (uuid, username, email);
CREATE INDEX clients_idx ON clients (uuid, username, email);
CREATE INDEX roles_idx ON roles (uuid);
CREATE INDEX groups_idx ON groups (uuid);
CREATE INDEX administrators_roles_idx ON administrators_roles (administrator_uuid, role_uuid);
CREATE INDEX clients_groups_idx ON clients_groups (client_uuid, group_uuid);
CREATE INDEX deployed_machines_idx ON deployed_machines (uuid, group, owner_uuid);
CREATE INDEX machines_clients_idx ON machines_clients (machine_uuid, client_uuid);

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

