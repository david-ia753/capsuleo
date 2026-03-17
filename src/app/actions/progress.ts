"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";

export async function toggleFileProgress(fileId: string, isCompleted: boolean) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Non autorisé" };
  }

  const userId = session.user.id;

  try {
    await prisma.fileProgress.upsert({
      where: {
        userId_fileId: {
          userId,
          fileId
        }
      },
      update: {
        isCompleted
      },
      create: {
        userId,
        fileId,
        isCompleted
      }
    });

    revalidatePath("/(stagiaire)/catalogue/[id]", "page");
    revalidatePath("/admin/dashboard");
    revalidatePath("/dashboard");
    
    return { success: true };
  } catch (error) {
    console.error("Error toggling file progress:", error);
    return { error: "Erreur lors de la mise à jour de la progression." };
  }
}
