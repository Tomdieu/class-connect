import NextAuth, { User } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { LoginResponseType } from "./types";
import { getAccountInfor } from "./actions/accounts";
import { getUserRole } from "./lib/utils";

export const { auth, handlers, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: {
          label: "Email",
          type: "email",
          placeholder: "xyz@gmail.com",
        },
        password: {
          label: "Password",
          type: "password",
          placeholder: "************",
        },
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) {
            console.log("Missing credentials");
            return null;
          }

          const body = {
            username: credentials.email,
            password: credentials.password,
            grant_type: "password",
            client_id: process.env.NEXT_CLASS_CONNECT_CLIENT_ID!,
            client_secret: process.env.NEXT_CLASS_CONNECT_CLIENT_SECRETE!,
          };

          const res = await fetch(
            process.env.NEXT_PUBLIC_BACKEND_URL + "/api/auth/token/",
            {
              method: "POST",
              body: JSON.stringify(body),
              headers: { "Content-Type": "application/json" },
            }
          );

          if (!res.ok) {
            console.log("Backend authentication failed:", res.status);
            return null;
          }

          const data = (await res.json()) as LoginResponseType;

          if (!data.access_token) {
            console.log("No access token in response");
            return null;
          }

          const expires_in = data.expires_in; // in seconds
          // calculate when the token expires to know when to logout the user when it expires
          const expiresAt = Date.now() + expires_in * 1000; // convert to milliseconds

          const user = await getAccountInfor(data.access_token);
          
          const role = getUserRole(user);

          return {
            ...user,
            email_verified:user.email_verified,
            accessToken: data.access_token,
            refreshToken: data.refresh_token,
            role,
            expiresAt,
          } as User;
        } catch (error) {
          console.log("Authorization error:", error);
          return null;
        }
      },
    }),
  ],
  pages:{
    signIn: "/auth/login",
  },
  callbacks: {
    jwt({ token, user, trigger, session }) {
      // Initial sign in
      if (user) {
        token = { ...token, ...user };
      }

      // Handle session updates
      if (trigger === "update") {
        token = { ...token, ...session.user };
      }

      return token;
    },
    session: ({ session, token, trigger, newSession }) => {
      // Handle the update trigger with newSession data
      if (trigger === "update" && newSession) {
        // Merge the session with newSession, preserving the user ID
        const updatedSession = { ...session, ...newSession };
        
        // Ensure ID is not overwritten if present in newSession
        if (session.user?.id) {
          updatedSession.user = {
            ...(updatedSession.user || {}),
            id: session.user.id
          };
        }
        
        return updatedSession;
      }

      // Normal session creation from token
      // Create a properly typed user object
      const userFromToken = { ...token } as any;
      delete userFromToken.exp;
      delete userFromToken.iat;
      delete userFromToken.sub;
      delete userFromToken.jti;
      delete userFromToken.picture;
      
      // Ensure id is always present and is a string
      if (!userFromToken.id || typeof userFromToken.id !== 'string') {
        throw new Error('User ID is required and must be a string');
      }
      
      session.user = userFromToken;

      return session;
    },
    async redirect({ url, baseUrl }) {
      // Allows relative callback URLs
      if (url.startsWith("/")) return `${baseUrl}${url}`
  
      // Allows callback URLs on the same origin
      if (new URL(url).origin === baseUrl) return url
  
      return baseUrl
    }
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.AUTH_SECRET || "CLASSCONNECT",
  events:{
    signIn(message) {
      console.log("signIn",message);
    },
  }
});
