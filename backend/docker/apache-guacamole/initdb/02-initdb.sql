CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE administrators (
    uuid UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(24) UNIQUE,
    password VARCHAR(60),
    name VARCHAR(50),
    surname VARCHAR(50),
    email VARCHAR(255) UNIQUE
);

CREATE TABLE clients (
    uuid UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(24) UNIQUE,
    password VARCHAR(60),
    name VARCHAR(50),
    surname VARCHAR(50),
    email VARCHAR(255) UNIQUE
);

CREATE TABLE roles (
    uuid UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50),
    permissions INT
);

CREATE TABLE groups (
    uuid UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50)
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

CREATE INDEX administrators_idx ON administrators (uuid, username, email);
CREATE INDEX clients_idx ON clients (uuid, username, email);
CREATE INDEX roles_idx ON roles (uuid);
CREATE INDEX groups_idx ON groups (uuid);