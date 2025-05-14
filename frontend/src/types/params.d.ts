declare interface UserParams {
    email?:string;
    first_name?:string,
    last_name?:string,
    name?:string,
    phone_number?:string,
    is_active?:boolean,
    date_joined?:string,
    language?:string,
    email_verified?:boolean,
    page?:string|number;
    is_student?:boolean;
    is_professional?:boolean;
    is_admin?:boolean;

    section?:string;
    education_level?:string;
    class_name?:string;

    has_subscription?:boolean;
    subscription_expiring?:boolean;
    subscription_expired?:boolean;

    subscription_plan?: "BASIC"|"STANDARD"|"PREMIUM"
}