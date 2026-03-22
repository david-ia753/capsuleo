import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import ModuleViewer from "./ModuleViewer";

export default async function ModulePage({
  params,
}: {
  params: { id: string };
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/auth/signin");
  }

  const { id } = await params;
  
  // LOG DIAGNOSTIC
  const debugPath = process.env.NODE_ENV === "production" ? "/app/api_debug.log" : "api_debug.log";
  try {
    const fs = require("fs");
    fs.appendFileSync(debugPath, `\n[CATALOGUE DEBUG] Hit for ID: ${id} at ${new Date().toISOString()}\n`);
  } catch (e) {}

  // Récupération de toutes les données liées au module
  const moduleData = await prisma.module.findUnique({
    where: { id: id },
    include: {
      files: {
        include: {
          progress: {
            where: { userId: session.user.id }
          }
        }
      },
      exercises: {
        include: {
          progress: {
            where: { userId: session.user.id }
          }
        }
      },
      fiches: {
        orderBy: { order: "asc" },
        include: {
          exercises: {
            include: {
              progress: {
                where: { userId: session.user.id }
              }
            }
          }
        }
      },
      groupModules: { select: { groupId: true } }
    },
  });

  try {
    const fs = require("fs");
    fs.appendFileSync(debugPath, `[CATALOGUE DEBUG] moduleFound: ${!!moduleData}\n`);
  } catch (e) {}

  if (!moduleData) {
    return (
      <div className="flex h-[50vh] flex-col items-center justify-center p-8 text-center text-white/50">
        <h2 className="text-2xl font-bold mb-4">Module introuvable</h2>
        <p>Le module auquel vous tentez d'accéder n'existe pas ou a été supprimé.</p>
      </div>
    );
  }

  // Vérifier l'accès (ADMIN et TRAINER ont accès à tout, les autres par groupe)
  const userRole = session.user.role;
  const userGroupId = session.user.groupId;

  const hasAccess = userRole === "ADMIN" || userRole === "TRAINER" || moduleData.groupModules.some((gm: any) => gm.groupId === userGroupId);

  if (!hasAccess) {
    return (
      <div className="flex h-[50vh] flex-col items-center justify-center p-8 text-center text-red-400">
        <h2 className="text-2xl font-bold mb-4">Accès Refusé</h2>
        <p>Ce module n'appartient pas à votre groupe de formation.</p>
      </div>
    );
  }

  return (
    <div className="w-full p-0 m-0 border-none outline-none">
      <ModuleViewer module={moduleData} />
    </div>
  );
}
