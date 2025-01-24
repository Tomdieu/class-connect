import { UserType } from "@/types";

export const getUserClass = (user:UserType) => {
    if(user.education_level === "LYCEE") {
        return user.lycee_class;
    }else if(user.education_level === "UNIVERSITY") {
        return user.university_level+`(${user.university_year})`;
    }else {
        return null;
    }
}