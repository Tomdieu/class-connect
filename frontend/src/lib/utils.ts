import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { ClassType, EducationLevel, Section, UserType } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const getFullName = (user: UserType) => {
  if (user.first_name !== "" && user.last_name !== "") {
    return user.first_name + " " + user.last_name
  }
  return user.first_name + user.last_name
}

export function getPathAfterLanguage(path: string): string {
  const parts = path.split('/');
  return `/${parts.slice(2).join('/')}`;
}

export function formatCurrency(amount: number | string) {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'XAF',
  }).format(numAmount);
}

export function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return "N/A";

  try {
    const date = new Date(dateString);
    // Check if date is valid
    if (isNaN(date.getTime())) {
      return "Invalid date";
    }

    return new Intl.DateTimeFormat('default', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(date);
  } catch (error) {
    console.error("Error formatting date:", error);
    return "Invalid date";
  }
}

/**
 * Extract initials from a name
 * @param name Full name
 * @returns Initials (first letter of first and last name)
 */
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((part) => part[0])
    .filter(Boolean)
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

/**
 * Formats a class name with speciality if present
 * @param classItem The class object to format
 * @returns Formatted class name string
 */
export function formatClassName(classItem: ClassType): string {
  if (!classItem) return '';

  let formattedName = classItem.definition_display;


  return formattedName;
}

/**
 * Groups classes by section and education level
 * @param classes Array of class objects
 * @returns Object with classes grouped by section and education level
 */
export interface GroupedClasses {
  [sectionKey: string]: {
    section: Section;
    levels: {
      [levelKey: string]: {
        level: EducationLevel;
        classes: ClassType[];
      }
    }
  }
}

export function groupClassesByHierarchy(classes: ClassType[]): GroupedClasses {
  if (!classes || !Array.isArray(classes)) return {};

  const grouped: GroupedClasses = {};

  classes.forEach(classItem => {
    // Get section key
    const sectionKey = classItem.section || 'UNKNOWN';

    // Initialize section if not exists
    if (!grouped[sectionKey]) {
      grouped[sectionKey] = {
        section: classItem.section,
        levels: {}
      };
    }

    // Get level key
    const levelKey = classItem.level || 'UNKNOWN';

    // Initialize level if not exists
    if (!grouped[sectionKey].levels[levelKey]) {
      grouped[sectionKey].levels[levelKey] = {
        level: classItem.level,
        classes: []
      };
    }

    // Add class to appropriate group
    grouped[sectionKey].levels[levelKey].classes.push(classItem);
  });

  return grouped;
}

/**
 * Creates options for a select component with classes grouped by section and education level
 * @param classes Array of class objects
 * @returns Array of option groups with nested options
 */
export function createClassSelectOptions(classes: ClassType[]) {
  const grouped = groupClassesByHierarchy(classes);

  return Object.entries(grouped).map(([, sectionData]) => {
    return {
      label: sectionData.section,
      options: Object.entries(sectionData.levels).flatMap(([, levelData]) => {
        return levelData.classes.map(classItem => ({
          value: classItem.id.toString(),
          label: formatClassName(classItem),
          data: classItem
        }));
      })
    };
  });
}

export const getUserRole = (user: UserType) => {
  if (user.is_superuser || user.is_staff) {
    return "admin";
  }

  const userType = user.user_type;

  if (userType === "PROFESSIONAL" || (user.class_enrolled === null && (user.platform_usage_reason != null && user.enterprise_name != null && user.is_superuser == false && user.is_staff == false))) {
    return "teacher";
  }

  if (userType === "STUDENT") {
    return "student";
  }

  if (userType === "ADMIN") {
    return "admin"
  }

  return "student";
}