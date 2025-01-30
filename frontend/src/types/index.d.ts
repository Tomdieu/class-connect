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

export declare interface ClassType {
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

export declare interface SubjectType {
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

export declare interface ChapterType {
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
  subject: number|string;
  order: number;
}

export declare interface TopicType {
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
  chapter: number|string;
  description?: string;
  order: number;
}

export declare interface ResourceType { 
  id:number,
  resource:AbstractResourceType
}


export declare interface AbstractResourceType {
id: number;
topic: number;
title: string;
description: string | null;
created_at: string;
updated_at: string;
polymorphic_ctype: number;
resource_type: 'VideoResource' | 'QuizResource' | 'RevisionResource' | 'PDFResource' | 'ExerciseResource';
}


export declare interface AbstractResourceCreateType {
topic: number;
title: string;
description?: string;
polymorphic_ctype: number; 
}

// Quiz Types
export declare interface QuestionOptionType {
  id: number;
  question: number;
  text: string;
  image: string | null;
  is_correct: boolean;
  order: number;
  created_at: string;
  updated_at: string;
 }
 
 export declare interface QuestionType {
  id: number;
  quiz: number;
  text: string;
  image: string | null;
  type: 'MULTIPLE_CHOICE' | 'SINGLE_CHOICE' | 'TRUE_FALSE' | 'SHORT_ANSWER';
  points: number;
  order: number;
  explanation: string;
  explanation_image: string | null;
  created_at: string;
  updated_at: string;
  options: QuestionOptionType[];
 }
 
 export declare interface QuizResourceType extends AbstractResourceType {
  total_questions: number;
  duration_minutes: number;
  passing_score: number;
  show_correct_answers: boolean;
  show_explanation: boolean;
  shuffle_questions: boolean;
  attempts_allowed: number;
  partial_credit: boolean;
  questions: QuestionType[];
 }
 
 export declare interface QuizAttemptType {
  id: number;
  quiz: number;
  user: number;
  score: number;
  started_at: string;
  completed_at: string | null;
  is_completed: boolean;
 }
 
 export declare interface QuestionResponseType {
  id: number;
  attempt: number;
  question: number;
  selected_options: number[];
  text_response: string;
  is_correct: boolean;
  points_earned: number;
  created_at: string;
  updated_at: string;
 }
 
 // Create Types
 export declare interface QuestionOptionCreateType {
  text: string;
  image?: File;
  is_correct: boolean;
  order: number;
 }
 
 export declare interface QuestionCreateType {
  text: string;
  image?: File;
  type: 'MULTIPLE_CHOICE' | 'SINGLE_CHOICE' | 'TRUE_FALSE' | 'SHORT_ANSWER';
  points: number;
  order: number;
  explanation: string;
  explanation_image?: File;
  options: QuestionOptionCreateType[];
 }
 
 export declare interface QuizResourceCreateType extends AbstractResourceCreateType {
  total_questions: number;
  duration_minutes: number;
  passing_score: number;
  show_correct_answers: boolean;
  show_explanation: boolean;
  shuffle_questions: boolean;
  attempts_allowed: number;
  partial_credit: boolean;
  questions: QuestionCreateType[];
 }
 
 export declare interface PDFResourceCreateType extends AbstractResourceCreateType {
  pdf_file: File;
 }
 
 export declare interface ExerciseResourceCreateType extends AbstractResourceCreateType {
  instructions: string;
  solution_file?: File;
  exercise_file?: File;
 }
 
 export declare interface RevisionResourceCreateType extends AbstractResourceCreateType {
  content: string;
 }
 
export declare interface UserAvailabilityType {
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

export declare interface DailyTimeSlotType {
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

export declare interface CourseOfferingType {
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

export declare interface CourseOfferingActionType {
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

export declare interface TeacherStudentEnrollmentType {
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

export declare interface CourseDeclarationType {
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

export declare interface UserProgressType {
  id: number;
  user: User;
  topic: Topic;
  resource: AbstractResourceType;
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