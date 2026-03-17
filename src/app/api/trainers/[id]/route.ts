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
    // 1. On vérifie que ce n'est pas un ADMIN
    const userToDelete = await prisma.user.findUnique({
        where: { id },
        select: { role: true }
    });

    if (userToDelete?.role === "ADMIN") {
        return NextResponse.json({ error: "Impossible de supprimer un administrateur via cette route" }, { status: 403 });
    }

    // 2. Dissocier les groupes (les rendre "Sans formateur")
    await prisma.group.updateMany({
      where: { trainerId: id },
      data: { trainerId: null }
    });

    // 3. Suppression du formateur
    await prisma.user.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erreur Suppression Formateur:", error);
    return NextResponse.json({ error: "Erreur lors de la suppression du formateur" }, { status: 500 });
  }
}
