import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { ModuleList } from "./ModuleList";
import { getMyModules } from "@/app/actions/modules";

export default async function ModulesPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/auth/login");
  }

  const modules = await getMyModules();

  return (
    <div className="max-w-6xl mx-auto py-10 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Mes Modules</h1>
        <p className="text-white/60">Accédez à vos formations et suivez votre progression.</p>
      </div>
      
      <ModuleList modules={modules} />
    </div>
  );
}
