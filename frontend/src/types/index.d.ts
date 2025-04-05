import { User } from "next-auth";
export declare const EDUCATION_LEVELS: readonly [
  "COLLEGE",
  "LYCEE",
  "UNIVERSITY",
  "PROFESSIONAL"
];
export declare const LYCEE_CLASSES: readonly ["2nde", "1ere", "terminale"];
export declare const LYCEE_SPECIALITIES: readonly ["scientifique", "litteraire"];
export declare const UNIVERSITY_LEVELS: readonly ["licence", "master", "doctorat"];
export declare const LICENCE_YEARS: readonly ["L1", "L2", "L3"];
export declare const MASTER_YEARS: readonly ["M1", "M2"];
export declare const SECTIONS: readonly ["FRANCOPHONE", "ANGLOPHONE"];
export declare const COLLEGE_CLASSES: readonly ["6eme", "5eme", "4eme", "3eme"];

export type EducationLevel = (typeof EDUCATION_LEVELS)[number];
export type LyceeClass = (typeof LYCEE_CLASSES)[number];
export type LyceeSpecialities = (typeof LYCEE_SPECIALITIES)[number];
export type UniversityLevel = (typeof UNIVERSITY_LEVELS)[number];
export type LicenceYear = (typeof LICENCE_YEARS)[number];
export type MasterYear = (typeof MASTER_YEARS)[number];
export type Section = (typeof SECTIONS)[number];
export type CollegeClass = (typeof COLLEGE_CLASSES)[number];

export declare const LANGUAGE_CHOICES: readonly ["en", "fr"];
export type LanguageChoice = (typeof LANGUAGE_CHOICES)[number];

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
  // Optional fields based on education level
  college_class?: CollegeClass;
  lycee_class?: LyceeClass;
  lycee_speciality?: LyceeSpecialities;
  university_level?: UniversityLevel;
  university_year?: string;
  enterprise_name?: string;
  platform_usage_reason?: string;
  is_staff?: boolean;
  is_superuser?: boolean;
}

export declare interface HasSub { active: boolean; plan: string; expires_at: string }
export declare interface NoSub { active: boolean }
export declare interface UserType {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  date_of_birth: string | null;
  education_level: EducationLevel;
  class_level: number | null;
  lycee_class: LyceeClass | null;
  lycee_speciality: LyceeSpecialities | null;
  university_level: UniversityLevel | null;
  university_year: string | null;
  enterprise_name: string | null;
  platform_usage_reason: string | null;
  email_verified: boolean;
  profile_picture: string | null;
  language: LanguageChoice;
  town: string | null;
  quarter: string | null;
  avatar: string;
  is_staff: boolean;
  is_superuser: boolean;
  is_active: boolean;
  last_login: string | null;
  created_at: string;
  updated_at: string;
  date_joined: string;
  college_class: CollegeClass | null;
  subscription_status:
    | HasSub
    | NoSub
  class_display: string;
}

export declare interface UserActiveToken {
  user: UserType;
  token: string;
  device_type: string | null; // mobile, tablet, desktop
  device_name: string | null; // iPhone 12, Samsung Galaxy S21, etc.
  os_name: string | null; // iOS, Android, Windows, macOS
  os_version: string | null;
  browser_name: string | null;
  browser_version: string | null;
  ip_address: string | null;
  last_activity: string; // ISO date string
  created_at: string; // ISO date string
  updated_at: string; // ISO date string
}

export declare const DAYS_OF_WEEK: readonly [
  "lun",
  "mar",
  "mer",
  "jeu",
  "ven",
  "sam",
  "dim"
];
export declare const TIME_SLOTS: readonly [
  "matin",
  "13h-14h",
  "14h-15h",
  "15h-16h",
  "16h-17h",
  "17h-18h",
  "18h-19h",
  "19h-20h"
];
export const USER_TYPE_CHOICES:readonly ["TEACHER", "STUDENT"];
export declare const COURSE_ACTION_STATUS: readonly [
  "PENDING",
  "ACCEPTED",
  "REJECTED",
  "CANCELLED"
];

export type DayOfWeek = (typeof DAYS_OF_WEEK)[number];
export type TimeSlot = (typeof TIME_SLOTS)[number];
export type UserRoleType = (typeof USER_TYPE_CHOICES)[number];
export type ActionStatus = (typeof COURSE_ACTION_STATUS)[number];
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
  section: Section;
  speciality?: LyceeSpecialities;
  description: string | null;
  created_at: string;
  updated_at: string;
  student_count:number;
}

// College structure
interface CollegeStructure {
  classes: ClassType[];
}

// Lycee structure
interface LyceeStructure {
  scientifique: ClassType[];
  litteraire: ClassType[];
}

// University structure
interface UniversityStructure {
  licence: ClassType[];
  master: ClassType[];
  doctorat: ClassType[];
}

// Section structure combining all levels
interface SectionStructure {
  COLLEGE: CollegeStructure;
  LYCEE: LyceeStructure;
  UNIVERSITY: UniversityStructure;
}

// Root type
interface SchoolStructure {
  FRANCOPHONE: SectionStructure;
  ANGLOPHONE: SectionStructure;
}

export declare interface ClassCreateType {
  name: string;
  level: EducationLevel;
  section: Section;
  description?: string;
  speciality?: LyceeSpecialities;
}

export declare interface SubjectType {
  id: number;
  name: string;
  description: string | null;
  class_level: ClassType;
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
  subject: SubjectType;
  order: number;
  created_at: string;
  updated_at: string;
}

export declare interface ChapterCreateType {
  title: string;
  description?: string;
  subject: number | string;
  order: number;
}

export declare interface TopicType {
  id: number;
  title: string;
  chapter: ChapterType;
  description: string | null;
  order: number;
  created_at: string;
  updated_at: string;
}

export declare interface TopicCreateType {
  title: string;
  chapter: number | string;
  description?: string;
  order: number;
}

export declare interface ResourceType {
  id: number;
  resource: AbstractResourceType;
}

export declare interface AbstractResourceType {
  id: number;
  topic: number;
  title: string;
  description: string | null;
  created_at: string;
  updated_at: string;
  polymorphic_ctype: number;
  resource_type:
    | "VideoResource"
    | "RevisionResource"
    | "PDFResource"
    | "ExerciseResource";
}

export declare interface AbstractResourceCreateType {
  topic: number;
  title: string;
  description?: string;
  polymorphic_ctype?: number;
}

export declare interface PDFResourceType extends AbstractResourceType {
  pdf_file: string;
  pdf_url?: string;
}

export declare interface VideoResourceType extends AbstractResourceType {
  video_file: string;
  video_url?: string;
}

export declare interface ExerciseResourceType extends AbstractResourceType {
  instructions: string;
  solution_file: string;
  exercise_file: string;
  solution_url?: string;
  exercise_url?: string;
}


export declare interface RevisionResourceType extends AbstractResourceType {
  content: string;
}

export declare interface PDFResourceCreateType
  extends AbstractResourceCreateType {
  pdf_file: File;
}

export declare interface VideoResourceCreateType
  extends AbstractResourceCreateType {
  video_file: File;
}
export declare interface RevisionResourceCreateType
  extends AbstractResourceCreateType {
  content: string;
}

export declare interface ExerciseResourceCreateType
  extends AbstractResourceCreateType {
  instructions: string;
  solution_file?: File;
  exercise_file: File;
}

export declare interface UserAvailabilityType {
  id: number;
  daily_slots: DailyTimeSlotType[];
  user: UserType;
  user_type: UserType;
  is_available: boolean;
  last_updated: string;
}

export declare interface UserAvailabilityCreateType {
  is_available: boolean;
}

export declare interface DailyTimeSlotType {
  id: number;
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
  student: UserType;
  subject: SubjectType;
  class_level: ClassType;
  duration: number;
  frequency: number;
  start_date: string;
  hourly_rate: number;
  is_available: boolean;
  created_at: string;
  updated_at: string;
}

export declare interface CourseOfferingCreateType {
  student_id: string; // UUID
  subject_id: number;
  class_level_id: number;
  duration: number;
  frequency: number;
  start_date: string;
  hourly_rate: number;
}

export declare interface CourseOfferingActionType {
  id: number;
  teacher: UserType;
  offer: CourseOfferingType;
  action: ActionStatus;
  created_at: string;
}

export declare interface CourseOfferingActionCreateType {
  teacher_id: string; // UUID
  offer_id: number;
  action?: ActionStatus;
}

export declare interface SchoolYearType {
  start_year: number;
  end_year: number;
  is_active: boolean;
  formatted_year: string;
}

export declare interface TeacherStudentEnrollmentType {
  id: number;
  teacher: UserType;
  teacher_id: string;
  offer: CourseOfferingType;
  offer_id: number;
  school_year: SchoolYearType;
  created_at: string;
  has_class_end: boolean;
}

export declare interface EnhaceTeacherStudentEnrollmentType {
  id: number;
  teacher: UserType;
  teacher_id: string;
  offer: CourseOfferingType;
  offer_id: number;
  school_year: SchoolYearType;
  created_at: string;
  has_class_end: boolean;
  subject: string;
  class_level: string;
  hourly_rate: number;
}

export declare interface TeacherStudentEnrollmentCreateType {
  teacher: string; // UUID
  offer: number;
  has_class_end: boolean;
}

export declare interface CourseDeclarationType {
  id: number;
  teacher_student_enrollment: TeacherStudentEnrollmentType;
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
  status: Omit<ActionStatus, "CANCELLED">;
}

export declare interface UserProgressType {
  id: number;
  user: UserType;
  topic: TopicType;
  resource: AbstractResourceType;
  completed: boolean;
  progress_percentage: number;
  last_accessed: string;
  current_page?: number;
  total_pages?: number;
  current_time?: number;
  total_duration?: number;
}

export declare interface LoginResponseType {
  access_token: string;
  expires_in: number;
  token_type: "Bearer";
  scope: "read write";
  refresh_token: string;
}

declare interface PaginationType<T> {
  count: number;
  next?: string;
  previous?: string;
  results: T[];
}

declare interface ChangePasswordType {
  current_password: string;
  new_password: string;
  confirm_password: string;
}

declare interface Payments {
  id: number;
  amount: number;
  payment_method: "MTN" | "ORANGE";
  transaction_id: string;
  status: "PENDING" | "SUCCESSFUL" | "FAILED";
  user: string;
  subscription: string;
  payment_date: string;
}

declare interface SubscriptionPlan {
  id: number;
  name: string;
  price: number;
  duration_days: number;
  description: string;
  features: {
    [key: string]: boolean | string;
  };
  active: boolean;
  created_at: string;
}

declare interface Subscription {
  id: number;
  user: string;
  plan: number;
  start_date: string;
  end_date: string;
  auto_renew: boolean;
  is_active: boolean;
}

declare interface SubscriptionDetail {
  id: number;
  user: UserType;
  plan: SubscriptionPlan;
  start_date: string;
  end_date: string;
  auto_renew: boolean;
  is_active: boolean;
}

// Enum definitions for choice fields
export enum TransactionType {
  COLLECT = "collect",
  WITHDRAW = "withdraw",
}

export enum TransactionStatus {
  SUCCESSFUL = "SUCCESSFUL",
  FAILED = "FAILED",
  PENDING = "PENDING",
}

export enum Operator {
  MTN = "MTN",
  ORANGE = "ORANGE",
}

export enum Currency {
  XAF = "XAF",
}

// Main Transaction interface
export interface Transaction {
  // Core transaction fields
  reference: string; // UUID
  status: TransactionStatus;
  amount: number;
  app_amount: number;
  currency: Currency;
  operator: Operator;
  endpoint: TransactionType;

  // Reference numbers
  code: string;
  operator_reference: string;
  external_reference?: string; // Optional UUID

  // Customer information
  phone_number: string;
  first_name?: string | null;
  last_name?: string | null;
  email?: string | null;
  external_user?: string | null;

  // Security and verification
  signature: string;

  // Metadata
  created_at: string; // ISO date string
  updated_at: string; // ISO date string

  // Computed properties
  transaction_type_display: string;
  is_successful: boolean;
  formatted_amount: string;
}

// Response type for API endpoints
export interface TransactionResponse {
  data: Transaction;
  status: "success" | "error";
  message?: string;
}

// List response type
export interface TransactionListResponse {
  results: Transaction[];
  count: number;
  next?: string | null;
  previous?: string | null;
}

// Date range filter type
export interface DateRangeFilter {
  after?: string; // ISO date string
  before?: string; // ISO date string
}

// Main transaction filter parameters
export interface TransactionFilterParams {
  // Filter fields from TransactionFilter class
  status?: "SUCCESSFUL" | "FAILED" | "PENDING";
  endpoint?: "collect" | "withdraw";
  operator?: "MTN" | "ORANGE";
  phone_number?: string;
  created_at?: DateRangeFilter;
  user_id?:string;//user id

  // Search parameter (from search_fields)
  search?: string; // Will search in phone_number and reference

  // Ordering parameter (from ordering_fields)
  ordering?: "created_at" | "-created_at" | "amount" | "-amount";

  // Pagination parameters (from CustomPagination)
  page?: number;
  page_size?: number;
}

export interface MonthStat {
  month: string;
  users: string;
}

export interface Stats {
  total_users: number;
  monthly_stats: MonthStat[];
  user_growth:string;
  monthly_revenue:number;
  revenue_growth:string;
  conversion_rate:number;
  conversion_growth:string;
}

export declare const NOTICATION_TYPES: readonly [
  "PAYMENT",
  "COURSE",
  "SESSION",
  "SYSTEM"
];

export type NOTICATION_TYPE = (typeof NOTICATION_TYPES)[number];

export declare interface NotificationType {
  id: number;
  user_id: string;
  title: string;
  message: string;
  notification_type: NOTICATION_TYPE;
  read: boolean;
  created_at: string;
}

export declare interface VideoConferenceSessionType {
  id: number;
  title: string;
}

export declare interface UserClassType {
  id: number;
  user: UserType;
  class_level: ClassType;
  school_year: SchoolYearType;
  created_at: string;
  updated_at: string;
}

export declare interface UserClassCreateType {
  user_id: string;
  class_level_id: number;
  school_year_id: number;
}

export declare interface UserStats {
  total_students: number;
  total_professionals: number;
  total_admins: number;
  total_users: number;
}

export type OnlineCourseStatus = "SCHEDULED"| "ONGOING"| "COMPLETED"| "CANCELLED"

export declare interface OnlineCourseType{
  id:number;
  meeting_link?:string;
  instructor_id:string;
  instructor:UserType;
  attendees:UserType[];
  title:string;
  description:string;
  start_time:string;
  duration_minutes:number;
  status:OnlineCourseStatus;
  recording_url:string;
  created_at:string;
  calendar_event_id:string;
}

export declare interface OnlineCourseCreateType{
  id:number;
  meeting_link?:string;
  instructor_id:string;
  title:string;
  description:string;
  start_time:string;
  duration_minutes:number;
  status:OnlineCourseStatus;
  calendar_event_id?:string;
}

export declare interface Attendees{
  user_ids:number[]
}

export declare interface ActivityLogType {
  id: number;
  action: string;
  ip_address: string;
  user_agent: string;
  request_method: string;
  request_path: string;
  referrer: string;
  extra_data?: Record<string, string>; // Key-value pair object
  timestamp: string; // ISO 8601 format
  user: string;
}


// export declare interface ForumType {
//   id:string;
//   name:string;
//   created_at:string;
// }

// export declare interface ForumCreateType {
//   name:string;
// }

// export declare interface ParentMessageType {
//   id: string;
//   sender: UserType;
//   content: string;
//   file?: string;
//   created_at: string;
//   forum: number | string;
// }

// export declare interface MessagesType {
//   id: string;
//   parent?: ParentMessageType; // parent message that this is replying to
//   forum: number | string;
//   sender: UserType;
//   content: string;
//   file?: string;
//   created_at: string;
//   seen_by: string[]; // users id of users who saw the message
//   replies: MessagesType[];
// }

// export declare interface MessageCreateType {
//   content: string;
//   parent?: number; // parent here represent the reply message id
//   file?: File;
// }

// export declare interface SeenType {
//   id: string;
//   message: string;
//   user: UserType;
//   created_at: string;
// }


// Forum
export interface ForumType {
  id: number;
  name: string;
  created_at: string;
}

export declare interface ForumCreateType {
  name: string;
}

// Reaction Types
export declare enum ReactionType {
  LIKE = 'LIKE',
  LOVE = 'LOVE',
  HAHA = 'HAHA',
  WOW = 'WOW',
  SAD = 'SAD',
  ANGRY = 'ANGRY'
}

// Reaction Count
export interface ReactionCountType {
  reaction_type: string;
  count: number;
}

// Reaction
export interface Reaction {
  id: number;
  post: number;
  user: User;
  reaction_type: ReactionType;
  created_at: string;
  reaction_choices?: Record<string, string>;
}

// Comment
export interface CommentType {
  id: number;
  sender: User;
  content: string;
  created_at: string;
  updated_at: string;
  file?: string | null;
  image?: string | null;
  reaction_counts: ReactionCount[];
  user_reaction: Reaction | null;
}

// Post
export interface PostType {
  id: number;
  forum: number;
  sender: User;
  content: string;
  file?: string | null;
  image?: string | null;
  created_at: string;
  updated_at: string;
  comments: PostType[];
  comment_count: number;
  reaction_counts: ReactionCount[];
  user_reaction: Reaction | null;
  seen_by: number[];
  view_count: number;
  parent?:PostType
}

// For backward compatibility, if needed
export type Message = Post; // This is a proxy model in Django, so it has the same fields as Post

// Seen
export interface SeenType {
  post: number;
  user: User;
  created_at: string;
}

// Notification types
export enum PostNotificationType {
  REACTION = 'REACTION',
  COMMENT = 'COMMENT',
  REPLY = 'REPLY',
  MENTION = 'MENTION'
}

// Notification
export interface ForumNotification {
  id: number;
  recipient: number;
  sender: UserType;
  post: PostType | null;
  notification_type: PostNotificationType;
  read: boolean;
  created_at: string;
}

// Request interfaces for creating/updating resources

export interface CreatePostRequestType {
  forum: number;
  content: string;
  file?: File | null;
  image?: File | null;
  parent?: number | null; // For comments
}

export interface UpdatePostRequestType {
  content?: string;
  file?: File | null;
  image?: File | null;
}

export interface CreateReactionRequestType {
  post: number;
  user_id: string;
  reaction_type: ReactionType;
}

export interface CreateSeenRequestType {
  post: number;
}

export interface UpdateNotificationRequestType {
  read: boolean;
}

// Response interfaces for API endpoints

export interface ForumListResponseType {
  results: Forum[];
  count: number;
  next: string | null;
  previous: string | null;
}

export interface PostListResponseType {
  results: Post[];
  count: number;
  next: string | null;
  previous: string | null;
}

export interface NotificationListResponseType {
  results: Notification[];
  count: number;
  next: string | null;
  previous: string | null;
}

// Utility type for API responses with pagination
export interface PaginatedResponse<T> {
  results: T[];
  count: number;
  next: string | null;
  previous: string | null;
}