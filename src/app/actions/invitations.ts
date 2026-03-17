"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";

export async function createInvitation(formData: FormData) {
  const email = formData.get("email") as string;
  const firstName = formData.get("firstName") as string;
  const lastName = formData.get("lastName") as string;

  if (!email) {
    throw new Error("L'email est requis");
  }

  try {
    // @ts-ignore
    await prisma.invitation.upsert({
      where: { email },
      update: {
        firstName,
        lastName,
        status: "PENDING",
      },
      create: {
        email,
        firstName,
        lastName,
        role: "TRAINER" as Role,
        status: "PENDING",
      },
    });

    revalidatePath("/admin/groups");
    return { success: true };
  } catch (error) {
    console.error("Failed to create invitation:", error);
    return { success: false, error: "Erreur lors de la création de l'invitation" };
  }
}

export async function getInvitations() {
  try {
    // @ts-ignore
    const result = await prisma.invitation.findMany({
      orderBy: { createdAt: "desc" },
    });
    return result || [];
  } catch (err) {
    console.error("INVITATIONS ACTION ERROR:", err);
    return [];
  }
}
