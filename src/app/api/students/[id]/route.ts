import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const { id } = await params;
  if (!id) {
    return NextResponse.json({ error: "ID manquant" }, { status: 400 });
  }

  const isAdmin = session.user.role === "ADMIN";
  const isTrainer = session.user.role === "TRAINER";

  if (!isAdmin && !isTrainer) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  try {
    if (isTrainer) {
      const student = await prisma.user.findUnique({
        where: { id },
        select: { trainerId: true }
      });
      if (student?.trainerId !== session.user.id) {
        return NextResponse.json({ error: "Vous ne pouvez supprimer que vos propres stagiaires" }, { status: 403 });
      }
    }

    // Suppression de l'élève (User)
    await prisma.user.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erreur Suppression Stagiaire:", error);
    return NextResponse.json({ error: "Erreur lors de la suppression du stagiaire" }, { status: 500 });
  }
}
