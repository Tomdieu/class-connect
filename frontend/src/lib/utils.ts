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

export function getPathAfterLanguage(path: string): string {
  const parts = path.split('/');
  return `/${parts.slice(2).join('/')}`;
}