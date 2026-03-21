"use client";

import { useState, useEffect } from "react";
import { Users, Loader2, X, CheckCircle2 } from "lucide-react";
import { getAvailableGroups, assignModulesToGroup, getGroupModuleIds } from "@/app/actions/groups";

interface AssignModuleModalProps {
  moduleId: string;
  moduleTitle: string;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AssignModuleModal({ 
  moduleId, 
  moduleTitle, 
  onClose, 
  onSuccess 
}: AssignModuleModalProps) {
  const [groups, setGroups] = useState<{id: string, name: string}[]>([]);
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const availableGroups = await getAvailableGroups();
        setGroups(availableGroups);
        
        // Find which groups already have this module
        const alreadyAssigned: string[] = [];
        for (const group of availableGroups) {
          const moduleIds = await getGroupModuleIds(group.id);
          if (moduleIds.includes(moduleId)) {
            alreadyAssigned.push(group.id);
          }
        }
        setSelectedGroups(alreadyAssigned);
      } catch (err) {
        setError("Erreur lors du chargement des groupes");
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [moduleId]);

  const handleToggleGroup = (groupId: string) => {
    setSelectedGroups(prev => 
      prev.includes(groupId) 
        ? prev.filter((id: string) => id !== groupId) 
        : [...prev, groupId]
    );
  };

  const handleSave = async () => {
    setIsSaving(true);
    setError("");
    try {
      // Note: assignModulesToGroup replaces ALL modules for a group. 
      // This is not what we want here. We want to add/remove a SINGLE module for MULTIPLE groups.
      // I'll need a more specific action or loop through groups.
      for (const group of groups) {
        const isCurrentlySelected = selectedGroups.includes(group.id);
        const currentModuleIds = await getGroupModuleIds(group.id);
        const hasModule = currentModuleIds.includes(moduleId);

        if (isCurrentlySelected && !hasModule) {
          await assignModulesToGroup(group.id, [...currentModuleIds, moduleId]);
        } else if (!isCurrentlySelected && hasModule) {
          await assignModulesToGroup(group.id, currentModuleIds.filter(id => id !== moduleId));
        }
      }
      onSuccess();
    } catch (err) {
      setError("Erreur lors de l'enregistrement des assignations");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 animate-in fade-in duration-300">
      <div className="absolute inset-0 bg-[#020617]/60 backdrop-blur-xl" onClick={onClose} />
      
      <div className="relative glass-card border-white/10 p-8 max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-300">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#0070FF]/10 flex items-center justify-center border border-[#0070FF]/20">
              <Users size={20} className="text-[#0070FF]" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white leading-tight">Assigner le module</h3>
              <p className="text-xs text-white/40 font-medium truncate max-w-[200px]">{moduleTitle}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/5 text-white/40 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-[#0070FF]" />
          </div>
        ) : (
          <div className="space-y-6">
            <div className="max-h-[300px] overflow-y-auto space-y-2 pr-2 custom-scrollbar">
              {groups.length === 0 ? (
                <p className="text-center py-8 text-white/20 text-sm font-medium">Aucun groupe disponible.</p>
              ) : (
                groups.map((group: {id: string, name: string}) => (
                  <button
                    key={group.id}
                    onClick={() => handleToggleGroup(group.id)}
                    className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all duration-300 ${
                      selectedGroups.includes(group.id)
                        ? "bg-[#0070FF]/10 border-[#0070FF]/40 text-white shadow-[0_0_20px_rgba(0,112,255,0.1)]"
                        : "bg-white/5 border-white/5 text-white/40 hover:border-white/10"
                    }`}
                  >
                    <span className="font-bold text-sm tracking-tight">{group.name}</span>
                    {selectedGroups.includes(group.id) && (
                      <CheckCircle2 size={20} className="text-[#0070FF]" />
                    )}
                  </button>
                ))
              )}
            </div>

            {error && <p className="text-red-400 text-xs font-medium text-center">{error}</p>}

            <button
              onClick={handleSave}
              disabled={isSaving}
              className="w-full py-4 rounded-[22px] bg-[#0070FF] text-white font-black uppercase tracking-widest text-xs hover:bg-[#0070FF]/90 hover:shadow-[0_10px_30px_rgba(0,112,255,0.3)] transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSaving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Valider l'assignation"
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
