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

  // Pour les stagiaires, on récupère les modules de leurs groupes
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      groups: {
        include: {
          assignedModules: {
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

  if (!user) return [];

  // On extrait tous les modules des groupes de l'utilisateur
  const modules = user.groups.flatMap(g => 
    g.assignedModules.map(am => am.module)
  );

  // Déduplication (au cas où un module est dans plusieurs groupes)
  const uniqueModules = Array.from(new Map(modules.map(m => [m.id, m])).values());

  return uniqueModules;
}
