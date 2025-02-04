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
        console.log(credentials);
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Invalid Credentials");
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

        const data = (await res.json()) as LoginResponseType;

        if (res.ok && !data.access_token) {
          return null;
        }

        if (res.ok && data.access_token) {
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
        }
        return null;
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        
        token = { ...token, ...user };
      }
      return token;
    },
    session: ({ session, token }) => {
      delete token.exp;
      delete token.iat;
      delete token.sub;
      delete token.jti;
      delete token.picture;
      delete token.user;
      session.user = token;

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
