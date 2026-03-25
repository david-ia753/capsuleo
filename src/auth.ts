import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { authConfig } from "./auth.config";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  providers: [
    Credentials({
      async authorize(credentials) {
        const email = credentials?.email ? (credentials.email as string).trim().toLowerCase() : null;
        const password = credentials?.password as string;

        if (!email) return null;

        const user = await prisma.user.findUnique({
          where: { email },
        });

        if (!user) {
          const invitation = await prisma.invitation.findUnique({
            where: { email, status: "PENDING" }
          });

          if (invitation) {
            throw new Error("USER_NOT_FOUND_BUT_INVITED");
          }
          return null;
        }

        if (!user.password) {
          throw new Error("NEED_PASSWORD_SETUP");
        }

        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        if (!isPasswordCorrect) {
          return null;
        }

        if (user.status === "PENDING") {
          throw new Error("USER_NOT_APPROVED");
        }

        if (user.status === "REJECTED") {
          throw new Error("USER_REJECTED");
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          groupId: user.groupId,
        };
      },
    }),
  ],
});
