import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { ClassType, EducationLevel, Section } from "@/types";

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
 * Formats a class name with speciality if present
 * @param classItem The class object to format
 * @returns Formatted class name string
 */
export function formatClassName(classItem: ClassType): string {
  if (!classItem) return '';
  
  let formattedName = classItem.name;
  
  // Add speciality if it exists (primarily for lycee classes)
  if (classItem.speciality) {
    formattedName += ` (${classItem.speciality})`;
  }
  
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
  
  return Object.entries(grouped).map(([sectionKey, sectionData]) => {
    return {
      label: sectionData.section,
      options: Object.entries(sectionData.levels).flatMap(([levelKey, levelData]) => {
        return levelData.classes.map(classItem => ({
          value: classItem.id.toString(),
          label: formatClassName(classItem),
          data: classItem
        }));
      })
    };
  });
}