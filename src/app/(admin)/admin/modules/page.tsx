import { ModuleLibraryClient } from "@/components/ModuleLibraryClient";

export default function ModulesPage() {
  return (
    <div className="w-full">
      <header className="mb-16">
        <h2 
          className="text-5xl font-black"
          style={{ 
            color: "#fbbf24",
            letterSpacing: "-0.04em", 
            textShadow: "0 0 15px rgba(251, 191, 36, 0.5)" 
          }}
        >
          Mes modules
        </h2>
      </header>
      
      <ModuleLibraryClient />
    </div>
  );
}
