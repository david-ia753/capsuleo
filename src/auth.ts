import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    // Mode développement : login par email sans mot de passe
    Credentials({
      name: "Email",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "votre@email.com" },
      },
      async authorize(credentials) {
        const email = credentials?.email as string;
        if (!email) return null;

        // Chercher l'utilisateur en base
        const user = await prisma.user.findUnique({
          where: { email },
        });

        if (!user) {
          // Chercher une invitation en attente
          const invitation = await prisma.invitation.findUnique({
            where: { email, status: "PENDING" }
          });

          // En dev, créer automatiquement le compte avec le rôle approprié
          const role = invitation ? invitation.role : "STUDENT";
          
          const newUser = await prisma.user.create({
            data: {
              email,
              name: invitation?.firstName ? `${invitation.firstName} ${invitation.lastName || ""}`.trim() : email.split("@")[0],
              role: role,
            },
          });

          // Marquer l'invitation comme complétée si elle existe
          if (invitation) {
            await prisma.invitation.update({
              where: { id: invitation.id },
              data: { status: "ACCEPTED" }
            });
          }

          return {
            id: newUser.id,
            email: newUser.email,
            name: newUser.name,
            role: newUser.role,
          };
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/auth/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        // Premier login : enrichir le token avec le rôle
        const dbUser = await prisma.user.findUnique({
          where: { email: token.email! },
          select: { id: true, role: true, groupId: true },
        });
        if (dbUser) {
          token.id = dbUser.id;
          token.role = dbUser.role;
          token.groupId = dbUser.groupId;
        }
      }
      return token;
    },
    async session({ session, token }) {
      // Injecter les infos du token dans la session
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.groupId = token.groupId as string | null;
      }
      return session;
    },
  },
});
