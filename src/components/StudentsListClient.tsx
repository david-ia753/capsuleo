"use client";

import { useState } from "react";
import { 
  Users, 
  UserPlus, 
  Trash2, 
  Library, 
  LayoutGrid, 
  Search,
  MoreHorizontal,
  Mail,
  GraduationCap,
  ShieldCheck,
  AlertTriangle,
  Loader2
} from "lucide-react";
import { updateStudentGroup, updateStudentTrainer } from "@/app/actions/groups";

interface Student {
  id: string;
  name: string | null;
  email: string | null;
  group: { id: string; name: string } | null;
  trainer: { id: string; name: string } | null;
}

interface Group {
  id: string;
  name: string;
}

interface Module {
  id: string;
  title: string;
}

export function StudentsListClient({ 
  students: initialStudents, 
  groups, 
  trainers,
  modules,
  isAdmin 
}: { 
  students: Student[], 
  groups: Group[], 
  trainers: { id: string; name: string }[],
  modules: Module[],
  isAdmin: boolean 
}) {
  const [students, setStudents] = useState(initialStudents);
  const [searchQuery, setSearchQuery] = useState("");
  const [showConfirmDelete, setShowConfirmDelete] = useState<Student | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const filteredStudents = students.filter(s => 
    (s.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
     s.email?.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleGroupUpdate = async (studentId: string, groupId: string | null) => {
    const res = await updateStudentGroup(studentId, groupId === "none" ? null : groupId);
    if (res.success) {
      window.location.reload();
    } else {
      alert("Erreur lors de la mise à jour du groupe.");
    }
  };

  const handleTrainerUpdate = async (studentId: string, trainerId: string | null) => {
    const res = await updateStudentTrainer(studentId, trainerId === "none" ? null : trainerId);
    if (res.success) {
      window.location.reload();
    } else {
      alert("Erreur lors de l'assignation du formateur.");
    }
  };

  const executeDelete = async () => {
    if (!showConfirmDelete) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/students/${showConfirmDelete.id}`, { method: "DELETE" });
      if (res.ok) {
        setStudents(students.filter(s => s.id !== showConfirmDelete.id));
        setShowConfirmDelete(null);
      } else {
        alert("Erreur lors de la suppression.");
      }
    } catch (error) {
      console.error("Delete error:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="w-full space-y-8">
      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-6 justify-between items-center bg-white/5 p-6 rounded-3xl border border-white/10 backdrop-blur-xl">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 w-5 h-5" />
          <input 
            type="text" 
            placeholder="Rechercher un stagiaire..." 
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-white placeholder-white/20 focus:outline-none focus:border-safran/50 transition-all font-medium"
          />
        </div>
        
        {isAdmin && (
          <div className="flex items-center gap-3">
            <div className="px-5 py-3 bg-safran/10 rounded-2xl border border-safran/20 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-safran" />
              <span className="text-[10px] font-black text-safran uppercase tracking-widest">Vue Administrative Globale</span>
            </div>
          </div>
        )}
      </div>

      {/* Students Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/5">
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-white/20">Stagiaire</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-white/20">Groupe / Cohorte</th>
                {isAdmin && <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-white/20">Formateur référent</th>}
                <th className="px-8 py-6 text-right text-[10px] font-black uppercase tracking-widest text-white/20">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={isAdmin ? 4 : 3} className="px-8 py-20 text-center">
                    <Users className="w-12 h-12 text-white/5 mx-auto mb-4" />
                    <p className="text-white/20 italic">Aucun stagiaire trouvé.</p>
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student) => (
                  <tr key={student.id} className="group hover:bg-white/[0.02] transition-colors">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-safran/10 flex items-center justify-center text-safran font-black">
                          {student.name?.slice(0, 1).toUpperCase() || <Users size={16} />}
                        </div>
                        <div>
                          <p className="font-bold text-white">{student.name || "Inconnu"}</p>
                          <p className="text-[10px] text-white/30 truncate uppercase tracking-tighter">{student.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <select 
                        className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs font-bold text-[#00f2ff] focus:ring-0 cursor-pointer outline-none hover:border-[#00f2ff]/30 transition-all uppercase"
                        value={student.group?.id || "none"}
                        onChange={(e) => handleGroupUpdate(student.id, e.target.value)}
                      >
                        <option value="none" className="bg-[#0b1120]">SANS GROUPE</option>
                        {groups.map(g => (
                          <option key={g.id} value={g.id} className="bg-[#0b1120]">{g.name.toUpperCase()}</option>
                        ))}
                      </select>
                    </td>
                    {isAdmin && (
                      <td className="px-8 py-5">
                        <select 
                          className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs font-bold text-white/40 focus:ring-0 cursor-pointer outline-none hover:border-safran/30 transition-all uppercase"
                          value={student.trainer?.id || "none"}
                          onChange={(e) => handleTrainerUpdate(student.id, e.target.value)}
                        >
                          <option value="none" className="bg-[#0b1120]">NON ASSIGNÉ</option>
                          {trainers.map(t => (
                            <option key={t.id} value={t.id} className="bg-[#0b1120]">{t.name?.toUpperCase() || "FORMATEUR"}</option>
                          ))}
                        </select>
                      </td>
                    )}
                    <td className="px-8 py-5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => setShowConfirmDelete(student)}
                          className="p-2.5 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-inner"
                          title="Supprimer définitivement"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Deletion Modal */}
      {showConfirmDelete && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-[#020617]/60 backdrop-blur-xl" onClick={() => !isDeleting && setShowConfirmDelete(null)} />
          <div className="relative glass-card border-white/10 p-10 max-w-sm w-full text-center shadow-2xl scale-100 animate-in zoom-in-95 duration-200">
            <div className="bg-red-500/20 w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-red-500/30">
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
            <h4 className="text-2xl font-bold text-white mb-3">Supprimer le stagiaire ?</h4>
            <p className="text-sm text-white/50 mb-8 leading-relaxed">
              Voulez-vous supprimer <span className="text-white font-bold">"{showConfirmDelete.name || showConfirmDelete.email}"</span> ? Cette action est irréversible.
            </p>
            <div className="flex flex-col gap-3">
              <button 
                onClick={executeDelete}
                disabled={isDeleting}
                className="w-full py-4 rounded-2xl bg-red-600 text-white font-black hover:bg-red-500 transition-all disabled:opacity-50"
              >
                {isDeleting ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "SUPPRIMER"}
              </button>
              <button 
                onClick={() => setShowConfirmDelete(null)}
                disabled={isDeleting}
                className="w-full py-4 rounded-2xl bg-white/5 text-white/60 font-medium hover:bg-white/10"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
