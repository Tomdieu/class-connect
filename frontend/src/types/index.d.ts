export const EDUCATION_LEVELS = ["LYCEE", "UNIVERSITY", "PROFESSIONAL"] as const;
export const LYCEE_CLASSES = ["6eme", "5eme", "4eme", "3eme", "2nde", "1ere", "terminale"] as const;
export const UNIVERSITY_LEVELS = ["licence", "master", "doctorat"] as const;
export const LICENCE_YEARS = ["L1", "L2", "L3"] as const;
export const MASTER_YEARS = ["M1", "M2"] as const;

export type EducationLevel = typeof EDUCATION_LEVELS[number];
export type LyceeClass = typeof LYCEE_CLASSES[number];
export type UniversityLevel = typeof UNIVERSITY_LEVELS[number];
export type LicenceYear = typeof LICENCE_YEARS[number];
export type MasterYear = typeof MASTER_YEARS[number];

export const LANGUAGE_CHOICES = ["en", "fr"] as const;
export type LanguageChoice = typeof LANGUAGE_CHOICES[number];

export declare interface UserCreateType {
  first_name: string;
  last_name: string;
  phone_number: string;
  date_of_birth: string;
  education_level: EducationLevel;
  email: string;
  town: string;
  quarter: string;
  password: string;
  confirm_password: string;
  // Optional fields based on education level
  lycee_class?: LyceeClass;
  university_level?: UniversityLevel;
  university_year?: string;
  enterprise_name?: string;
  platform_usage_reason?: string;
}

export declare interface UserType {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  date_of_birth: string | null;
  education_level: EducationLevel;
  lycee_class: LyceeClass | null;
  university_level: UniversityLevel | null;
  university_year: string | null;
  enterprise_name: string | null;
  platform_usage_reason: string | null;
  email_verified: boolean;
  profile_picture: string | null;
  language: LanguageChoice;
  town: string | null;
  quarter: string | null;
  is_staff: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  date_joined: string;
}

export declare interface UserActiveToken {
  user: User;
  token: string;
  device_type: string | null;  // mobile, tablet, desktop
  device_name: string | null;  // iPhone 12, Samsung Galaxy S21, etc.
  os_name: string | null;      // iOS, Android, Windows, macOS
  os_version: string | null;
  browser_name: string | null;
  browser_version: string | null;
  ip_address: string | null;
  last_activity: string;       // ISO date string
  created_at: string;         // ISO date string
  updated_at: string;         // ISO date string
}

export const DAYS_OF_WEEK = ["lun", "mar", "mer", "jeu", "ven", "sam", "dim"] as const;
export const TIME_SLOTS = ["matin", "13h-14h", "14h-15h", "15h-16h", "16h-17h", "17h-18h", "18h-19h", "19h-20h"] as const;
export const USER_TYPE_CHOICES = ["TEACHER", "STUDENT"] as const;
export const COURSE_ACTION_STATUS = ["PENDING", "ACCEPTED", "REJECTED", "CANCELLED"] as const;

export type DayOfWeek = typeof DAYS_OF_WEEK[number];
export type TimeSlot = typeof TIME_SLOTS[number];
export type UserType = typeof USER_TYPE_CHOICES[number];
export type ActionStatus = typeof COURSE_ACTION_STATUS[number];
export declare interface CourseCategory {
  id: number;
  name: string;
  description: string | null;
  parent: number | null;
}

export declare interface CourseCategoryCreateType {
  name: string;
  description?: string;
  parent?: number;
}

export declare interface Class {
  id: number;
  name: string;
  level: EducationLevel;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export declare interface ClassCreateType {
  name: string;
  level: EducationLevel;
  description?: string;
}

export declare interface Subject {
  id: number;
  name: string;
  description: string | null;
  class_level: Class;
  created_at: string;
  updated_at: string;
}

export declare interface SubjectCreateType {
  name: string;
  description?: string;
  class_level: number;
}

export declare interface Chapter {
  id: number;
  title: string;
  description: string | null;
  subject: Subject;
  order: number;
  created_at: string;
  updated_at: string;
}

export declare interface ChapterCreateType {
  title: string;
  description?: string;
  subject: number;
  order: number;
}

export declare interface Topic {
  id: number;
  title: string;
  chapter: Chapter;
  description: string | null;
  order: number;
  created_at: string;
  updated_at: string;
}

export declare interface TopicCreateType {
  title: string;
  chapter: number;
  description?: string;
  order: number;
}

export declare interface AbstractResource {
  id: number;
  topic: Topic;
  title: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export declare interface AbstractResourceCreateType {
  topic: number;
  title: string;
  description?: string;
}

export declare interface VideoResource extends AbstractResource {
  video_url: string | null;
  video_file: string | null;
}

export declare interface VideoResourceCreateType extends AbstractResourceCreateType {
  video_url?: string;
  video_file?: File;
}

export declare interface UserAvailability {
  id: number;
  user: User;
  user_type: UserType;
  is_available: boolean;
  last_updated: string;
}

export declare interface UserAvailabilityCreateType {
  user: string; // UUID
  user_type: UserType;
  is_available: boolean;
}

export declare interface DailyTimeSlot {
  id: number;
  availability: UserAvailability;
  day: DayOfWeek;
  time_slot: TimeSlot;
  is_available: boolean;
}

export declare interface DailyTimeSlotCreateType {
  availability: number;
  day: DayOfWeek;
  time_slot: TimeSlot;
  is_available: boolean;
}

export declare interface CourseOffering {
  id: number;
  student: User;
  subject: Subject;
  class_level: Class;
  duration: number;
  frequency: number;
  start_date: string;
  hourly_rate: number;
  is_available: boolean;
}

export declare interface CourseOfferingCreateType {
  student: string; // UUID
  subject: number;
  class_level: number;
  duration: number;
  frequency: number;
  start_date: string;
  hourly_rate: number;
}

export declare interface CourseOfferingAction {
  id: number;
  teacher: User;
  offer: CourseOffering;
  action: ActionStatus;
  created_at: string;
}

export declare interface CourseOfferingActionCreateType {
  teacher: string; // UUID
  offer: number;
  action: ActionStatus;
}

export declare interface TeacherStudentEnrollment {
  id: number;
  teacher: User;
  offer: CourseOffering;
  created_at: string;
  has_class_end: boolean;
}

export declare interface TeacherStudentEnrollmentCreateType {
  teacher: string; // UUID
  offer: number;
  has_class_end: boolean;
}

export declare interface CourseDeclaration {
  id: number;
  teacher_student_enrollment: TeacherStudentEnrollment;
  duration: number;
  declaration_date: string;
  accepted_by: User | null;
  status: ActionStatus;
  updated_at: string;
}

export declare interface CourseDeclarationCreateType {
  teacher_student_enrollment: number;
  duration: number;
  declaration_date: string;
  accepted_by?: string; // UUID
  status: ActionStatus;
}

export declare interface UserProgress {
  id: number;
  user: User;
  topic: Topic;
  resource: AbstractResource;
  completed: boolean;
  progress_percentage: number;
  last_accessed: string;
}


export declare interface LoginResponseType {
  access_token: string;
  expires_in: number;
  token_type: "Bearer";
  scope: "read write";
  refresh_token: string;
}


 declare interface PaginationType<T> {
  count:number;
  next?:string,
  previous?:string;
  results:T[]
}

declare interface ChangePasswordType {
  current_password:string;
  new_password:string;
  confirm_password:string;

}