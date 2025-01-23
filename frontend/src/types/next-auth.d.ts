import "next-auth";
import { UserType } from "./index";

declare module 'next-auth' {
    interface User extends UserType {
      accessToken: string;
      refreshToken: string;
      expiresAt: number;
      emailVerified?: Date | null;
    }

    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    interface AdapterUser extends User {}
  
    interface Session {
      user: JWT;
    }

    type JWT = User
  
  }
