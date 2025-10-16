import { values } from "lodash";
import { GroupInDB, RoleInDB, User } from "../../../../types/api.types";

export const prepareData = (accounts: Record<string, User>) =>
    values(accounts).map((user) => ({
        uuid: user.uuid,
        roles: user?.roles?.map((role: RoleInDB) => role.name),
        groups: user?.groups?.map((group: GroupInDB) => group.name),
        lastActive: user.last_active,
        details: {
            username: user.username,
            name: user.name,
            surname: user.surname,
            email: user.email,
        },
    }));
