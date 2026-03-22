import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { Role } from "@prisma/client";

export async function getMyModules() {
  const session = await auth();
  if (!session?.user) return [];

  const userId = session.user.id;
  const role = session.user.role;

  if (role === Role.ADMIN) {
    return await prisma.module.findMany({
      orderBy: { createdAt: 'desc' }
    });
  }

  // Pour les stagiaires, on récupère les modules de leur groupe
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      group: {
        include: {
          groupModules: {
            include: {
              module: true
            },
            orderBy: {
              order: 'asc'
            }
          }
        }
      }
    }
  });

  if (!user || !user.group) return [];

  // On extrait les modules du groupe de l'utilisateur
  const modules = user.group.groupModules.map(gm => gm.module);

  return modules;
}
