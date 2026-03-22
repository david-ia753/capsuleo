import UploadZone from "@/components/UploadZone";
import { prisma } from "@/lib/prisma";

export default async function UploadPage() {
  const groups = await prisma.group.findMany({
    orderBy: { name: "asc" },
  });

  return (
    <div className="w-full">
      <header className="mb-12">
        <h1 className="text-4xl font-black text-[#FFC800] uppercase tracking-[0.05em] mb-2">Catalogue</h1>
        <h2 className="text-xl font-bold text-white/50">Formation</h2>
        <p className="text-white/30 text-lg font-medium max-w-2xl mt-4 italic">
          Importez vos supports bruts (PDF, Audio MP4/M4A). Notre IA se charge de structurer le cours, d'extraire les objectifs et de générer les évaluations interactives.
        </p>
      </header>

      {/* Selecteur de Groupe Premium */}
      <div className="mb-12 max-w-4xl mx-auto bg-white/5 p-8 rounded-3xl border border-blue-500/30 shadow-[0_0_30px_rgba(0,112,255,0.1)] backdrop-blur-md relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#0070FF]/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        
        <label htmlFor="groupId" className="block mb-4 font-black uppercase tracking-widest text-[#FFC800] text-sm flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-[#FFC800] animate-pulse" />
          Assigner au groupe pédagogique :
        </label>
        
        <div className="relative z-10">
          <select 
            name="groupId" 
            id="groupId"
            defaultValue={groups.find((g: any) => g.name === 'Général')?.id || groups[0]?.id}
            className="w-full p-4 rounded-xl bg-[#001D3A] text-white border-2 border-white/10 hover:border-[#0070FF]/50 focus:border-[#0070FF] focus:shadow-[0_0_20px_rgba(0,112,255,0.4)] transition-all outline-none appearance-none font-bold cursor-pointer text-lg"
          >
            {groups.map((group: any) => (
              <option key={group.id} value={group.id}>
                {group.name}
              </option>
            ))}
          </select>
          <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-[#FFC800]">
            ▼
          </div>
        </div>
      </div>

      <UploadZone defaultGroupId={groups.find((g: any) => g.name === 'Général')?.id} />
    </div>
  );
}
