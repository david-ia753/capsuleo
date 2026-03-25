import { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";

// On définit ici la config qui ne dépend PAS de Prisma
// Pour que le middleware puisse l'importer dans l'Edge Runtime
export const authConfig = {
  providers: [
    // On laisse le provider vide ou on le définit partiellement
    // Car Credentials nécessite bcrypt et Prisma qui ne sont pas Edge-compatible
    // En NextAuth v5, le middleware utilise principalement les callbacks et la stratégie JWT
    Credentials({
        async authorize() {
            return null; // Sera écrasé dans auth.ts
        }
    })
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id as string;
        token.role = (user as any).role as string;
        token.groupId = (user as any).groupId as string | null;
        token.firstName = (user as any).firstName as string | null;
        token.lastName = (user as any).lastName as string | null;
      }
      if (trigger === "update" && session) {
        token.firstName = session.firstName;
        token.lastName = session.lastName;
        token.email = session.email;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.groupId = token.groupId as string | null;
        session.user.firstName = token.firstName as string | null;
        session.user.lastName = token.lastName as string | null;
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/login",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || "antigravity-dev-secret-key-change-in-production-2024",
  trustHost: true,
} satisfies NextAuthConfig;
