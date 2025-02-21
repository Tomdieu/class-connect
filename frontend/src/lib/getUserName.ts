import { UserType } from "@/types";

export const getUserName = (user: UserType) => {
    return user.first_name + " " + user.last_name;
}