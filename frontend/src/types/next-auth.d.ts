import "next-auth";
import { UserType } from "./index";

declare module 'next-auth' {
    interface User extends UserType {
      accessToken: string;
      refreshToken: string;
      expiresAt: number;
      emailVerified?: Date | null;
      role: "admin" | "teacher" | "student";
    }

    interface AdapterUser extends User {
      emailVerified: Date | null;
    }
  
    interface Session {
      user: User & {
        id: string;
      };
    }

    interface JWT extends Record<string, unknown> {
      // All User properties
      [key: string]: any;
      
      // JWT specific properties that we want to exclude
      exp?: number;
      iat?: number;
      sub?: string;
      jti?: string;
      picture?: string;
    }
  
  }
