import { UserInDB } from "../types/api.types";

export const getFullUserName = (user: UserInDB) => (user.name || user.surname ? `${user.name} ${user.surname}`.trim() : user.username);
