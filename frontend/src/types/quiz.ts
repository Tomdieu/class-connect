
//  export declare interface QuizResourceType extends AbstractResourceType {
//   total_questions: number;
//   duration_minutes: number;
//   passing_score: number;
//   show_correct_answers: boolean;
//   show_explanation: boolean;
//   shuffle_questions: boolean;
//   attempts_allowed: number;
//   partial_credit: boolean;
//   questions: QuestionType[];
//  }
 
//  export declare interface QuizAttemptType {
//   id: number;
//   quiz: number;
//   user: number;
//   score: number;
//   started_at: string;
//   completed_at: string | null;
//   is_completed: boolean;
//  }
 
//  export declare interface QuestionResponseType {
//   id: number;
//   attempt: number;
//   question: number;
//   selected_options: number[];
//   text_response: string;
//   is_correct: boolean;
//   points_earned: number;
//   created_at: string;
//   updated_at: string;
//  }
 
//  // Create Types
//  export declare interface QuestionOptionCreateType {
//   text: string;
//   image?: File;
//   is_correct: boolean;
//   order: number;
//  }
 
//  export declare interface QuestionCreateType {
//   text: string;
//   image?: File;
//   type: 'MULTIPLE_CHOICE' | 'SINGLE_CHOICE' | 'TRUE_FALSE' | 'SHORT_ANSWER';
//   points: number;
//   order: number;
//   explanation: string;
//   explanation_image?: File;
//   options: QuestionOptionCreateType[];
//  }
 
//  export declare interface QuizResourceCreateType extends AbstractResourceCreateType {
//   total_questions: number;
//   duration_minutes: number;
//   passing_score: number;
//   show_correct_answers: boolean;
//   show_explanation: boolean;
//   shuffle_questions: boolean;
//   attempts_allowed: number;
//   partial_credit: boolean;
//   questions: QuestionCreateType[];
//  }
 