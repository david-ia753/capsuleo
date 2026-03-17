"use server";

import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";

export async function getInvitationByToken(token: string) {
  if (!token) {
    return null;
  }

  try {
    // @ts-ignore
    const invitation = await prisma.invitation.findUnique({
      where: { token },
    });

    if (!invitation || invitation.status !== "PENDING") {
      return null;
    }

    // Vérifier l'expiration
    if (new Date() > new Date(invitation.expiresAt)) {
      return null;
    }

    return invitation;
  } catch (error) {
    return null;
  }
}

export async function completeRegistration(formData: FormData) {
  const token = formData.get("token") as string;
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (!token || !password || password !== confirmPassword) {
    return { error: "Données invalides ou mots de passe non identiques." };
  }

  if (password.length < 8) {
    return { error: "Le mot de passe doit faire au moins 8 caractères." };
  }

  try {
    // @ts-ignore
    const invitation = await prisma.invitation.findUnique({
      where: { token },
    });

    if (!invitation || invitation.status !== "PENDING") {
      return { error: "Invitation invalide ou déjà utilisée." };
    }

    // Créer le compte
    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.$transaction([
      prisma.user.create({
        data: {
          email: invitation.email,
          name: `${invitation.firstName} ${invitation.lastName}`.trim(),
          password: hashedPassword,
          role: "TRAINER" as any,
        },
      }),
      prisma.invitation.update({
        where: { id: invitation.id },
        data: { status: "ACCEPTED" },
      }),
    ]);

    return { success: true };
  } catch (error) {
    console.error("CRITICAL REGISTRATION ERROR:", error);
    if (error instanceof Error) {
      console.error("Error Message:", error.message);
      console.error("Error Stack:", error.stack);
    }
    return { error: "Une erreur est survenue lors de la création de votre compte." };
  }
}
