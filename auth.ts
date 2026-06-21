import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { loginWithGoogle } from "@/lib/api/auth";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [Google],

  callbacks: {
    async jwt({ token, account }) {
      // 최초 Google 로그인 시 newron 서버에서 자체 토큰 교환
      if (account?.id_token) {
        try {
          const newronUser = await loginWithGoogle(account.id_token);
          token.newronToken  = newronUser.access_token;
          token.newronUserId = String(newronUser.user_id);
          token.name         = newronUser.name;
          token.email        = newronUser.email;
          token.isNew        = newronUser.is_new;
        } catch {
          token.error = "NewronAuthError";
        }
      }
      return token;
    },

    async session({ session, token }) {
      session.newronToken  = token.newronToken  as string | undefined;
      session.newronUserId = token.newronUserId as string | undefined;
      session.error        = token.error        as string | undefined;
      return session;
    },
  },

  pages: {
    signIn: "/login",
  },
});
