"use server";

import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";
import { revalidatePath } from "next/cache";

export async function inviteMember(formData: FormData) {
  const email = formData.get("email") as string;
  
  if (!email) return { error: "Email requis" };

  try {
    // On crée une invitation
    await prisma.invitation.create({
      data: {
        email,
        role: Role.TRAINER,
        status: "PENDING"
      }
    });

    revalidatePath("/admin/equipe");
    return { success: true };
  } catch (error: any) {
    if (error.code === 'P2002') {
      return { error: "Une invitation existe déjà pour cet email." };
    }
    return { error: "Erreur lors de l'envoi de l'invitation." };
  }
}

export async function getTeamData() {
  const members = await prisma.user.findMany({
    where: {
      role: {
        in: [Role.ADMIN, Role.TRAINER]
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  const invitations = await prisma.invitation.findMany({
    where: {
      status: "PENDING"
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  return { members, invitations };
}
