import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Accès refusé" }, { status: 401 });
  }

  const { id } = await params;

  if (!id) {
    return NextResponse.json({ error: "ID manquant" }, { status: 400 });
  }

  try {
    // 1. Désassignation des stagiaires (on ne veut pas les supprimer, juste les rendre indépendants)
    await prisma.user.updateMany({
      where: { groupId: id },
      data: { groupId: null }
    });

    // 2. Suppression du groupe
    await prisma.group.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erreur Suppression Groupe:", error);
    return NextResponse.json({ error: "Erreur lors de la suppression du groupe" }, { status: 500 });
  }
}
