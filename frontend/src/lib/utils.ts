import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const getFullName = (user:UserType) => {
  if(user.first_name !== "" && user.last_name!==""){
      return user.first_name + " "+ user.last_name
  }
  return user.first_name + user.last_name
}