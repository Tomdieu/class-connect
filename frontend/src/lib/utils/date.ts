import { format } from "date-fns";
import { fr, enUS } from "date-fns/locale";

export const formatDate = (date: string | Date, localeStr: string = "en") => {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  const locale = localeStr === "fr" ? fr : enUS;

  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  // Check if date is today
  if (format(dateObj, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd')) {
    return format(dateObj, "'Today at' h:mm a", { locale });
  }

  // Check if date is yesterday
  if (format(dateObj, 'yyyy-MM-dd') === format(yesterday, 'yyyy-MM-dd')) {
    return format(dateObj, "'Yesterday at' h:mm a", { locale });
  }

  // If within this year
  if (dateObj.getFullYear() === today.getFullYear()) {
    return format(dateObj, 'MMM d • h:mm a', { locale });
  }

  // If different year
  return format(dateObj, 'MMM d, yyyy • h:mm a', { locale });
};
