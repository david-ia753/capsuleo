import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  secret: process.env.AUTH_SECRET || "antigravity-dev-secret-key-change-in-production-2024",
  trustHost: true,
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Mot de passe", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.email ? (credentials.email as string).trim().toLowerCase() : null;
        const password = credentials?.password as string;

        if (!email) return null;

        // Chercher l'utilisateur en base
        const user = await prisma.user.findUnique({
          where: { email },
        });

        // Si l'utilisateur n'existe pas, on vérifie s'il y a une invitation
        if (!user) {
          const invitation = await prisma.invitation.findUnique({
            where: { email, status: "PENDING" }
          });

          if (invitation) {
            // L'utilisateur existe en tant qu'invité mais n'a pas encore de compte User
            // On renvoie une erreur spécifique pour que le client redirige vers la création de mot de passe
            throw new Error("USER_NOT_FOUND_BUT_INVITED");
          }
          return null;
        }

        // Si l'utilisateur existe mais n'a pas de mot de passe (première connexion)
        if (!user.password) {
          throw new Error("NEED_PASSWORD_SETUP");
        }

        // Vérifier le mot de passe
        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        if (!isPasswordCorrect) {
          return null;
        }

        // Vérifier le statut de l'utilisateur
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
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/auth/login",
  },
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        // L'objet 'user' provient du retour de 'authorize' (Credentials) ou de la DB (Adapter)
        // On évite un fetch DB redondant ici
        token.id = user.id as string;
        token.role = (user as any).role as string;
        token.groupId = (user as any).groupId as string | null;
        token.firstName = (user as any).firstName as string | null;
        token.lastName = (user as any).lastName as string | null;
      }

      // Gérer la mise à jour du profil via trigger "update"
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
});
