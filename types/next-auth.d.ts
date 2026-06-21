import type { DefaultSession, DefaultJWT } from "next-auth";

declare module "next-auth" {
  interface Session extends DefaultSession {
    newronToken?:  string;
    newronUserId?: string;
    error?:        string;
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    newronToken?:  string;
    newronUserId?: string;
    isNew?:        boolean;
    error?:        string;
  }
}
