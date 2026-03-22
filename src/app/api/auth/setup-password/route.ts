import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const { email, password, firstName, lastName, groupId } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email et mot de passe requis" }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase();

    // On cherche l'utilisateur
    let user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    // On cherche une invitation si l'utilisateur n'existe pas
    const invitation = await prisma.invitation.findUnique({
      where: { email: normalizedEmail },
    });

    // if (!user && !invitation) {
    //   return NextResponse.json({ error: "Accès non autorisé" }, { status: 403 });
    // }

    const hashedPassword = await bcrypt.hash(password, 10);

    if (user) {
      // Cas où l'utilisateur existe déjà (créé via invitation ou autre) mais n'a pas de mot de passe
      const roleToUpdate = invitation?.role || user.role;
      const statusToUpdate = invitation ? "APPROVED" : user.status;

      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          password: hashedPassword,
          firstName: firstName || user.firstName,
          lastName: lastName || user.lastName,
          name: `${firstName || user.firstName} ${lastName || user.lastName}`.trim(),
          role: roleToUpdate,
          status: statusToUpdate as any,
        },
      });
    } else {
      // Cas d'une nouvelle inscription (via invitation ou libre)
      const roleFromInvitation = invitation?.role || "STUDENT";
      const statusFromInvitation = invitation ? "APPROVED" : "PENDING";

      let trainerId = null;
      if (groupId) {
        const group = await prisma.group.findUnique({ where: { id: groupId } });
        trainerId = group?.trainerId || null;
      }

      user = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          firstName: firstName,
          lastName: lastName,
          name: `${firstName} ${lastName || ""}`.trim(),
          role: roleFromInvitation,
          status: statusFromInvitation as any,
          groupId: groupId || null,
          trainerId: trainerId
        },
      });

      // Si c'était une invitation, on la marque comme acceptée
      if (invitation) {
        await prisma.invitation.update({
          where: { id: invitation.id },
          data: { status: "ACCEPTED" }
        });
      }
    }

    return NextResponse.json({ message: "Compte configuré avec succès" });
  } catch (error) {
    console.error("Setup password error:", error);
    return NextResponse.json({ error: "Erreur lors de la configuration du compte" }, { status: 500 });
  }
}
