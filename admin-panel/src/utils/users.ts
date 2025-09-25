import { User } from "../types/api.types";

export const getFullUserName = (user: User) => (user.name || user.surname ? `${user.name} ${user.surname}` : user.username);
