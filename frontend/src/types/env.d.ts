declare namespace NodeJS {
    export interface ProcessEnv {
      NEXT_PUBLIC_BACKEND_URL: string;
      NEXT_CLASS_CONNECT_CLIENT_SECRETE: string;
      NEXT_CLASS_CONNECT_CLIENT_ID: string;
      NEXTAUTH_URL:string;
      AUTH_SECRET:string;
    }
  }