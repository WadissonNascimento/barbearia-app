import type { NextAuthConfig } from "next-auth";

const authConfig = {
  providers: [],

  session: {
    strategy: "jwt",
  },

  pages: {
    signIn: "/login",
  },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { role?: string }).role ?? "CUSTOMER";
        token.active = (user as { active?: boolean }).active ?? true;
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.active = Boolean(token.active);
      }

      return session;
    },
  },
} satisfies NextAuthConfig;

export default authConfig;
