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
      } as any,
      fiches: { orderBy: { order: "asc" } },
      groups: { select: { id: true } }
    } as any,
  });

  if (!moduleData) {
    return (
      <div className="flex h-[50vh] flex-col items-center justify-center p-8 text-center text-white/50">
        <h2 className="text-2xl font-bold mb-4">Module introuvable</h2>
        <p>Le module auquel vous tentez d'accéder n'existe pas ou a été supprimé.</p>
      </div>
    );
  }

  // Vérifier si l'utilisateur a accès au groupe de ce module
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { groupId: true, role: true },
  });

  const hasAccess = user?.role === "ADMIN" || user?.role === "TRAINER" || moduleData.groups.some(g => g.id === user?.groupId);

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
