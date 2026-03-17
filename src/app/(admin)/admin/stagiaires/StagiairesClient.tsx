"use client";

import { useState } from "react";
import { 
  Users, 
  Plus, 
  Library, 
  Settings2, 
  X,
  UserPlus,
  BookOpen,
  Search,
  Check,
  ChevronDown,
  ChevronUp,
  GraduationCap,
  Trash2,
  AlertTriangle,
  Loader2,
  Link as LinkIcon,
  Mail
} from "lucide-react";
import { createGroup, assignModulesToGroup, updateStudentGroup, assignTrainerToGroup, quickAddStudent } from "@/app/actions/groups";

interface Group {
  id: string;
  name: string;
  description: string | null;
  trainerId: string | null;
  users: { id: string, name: string | null, email: string | null }[];
  trainer: { id: string, name: string | null } | null;
  _count: {
    users: number;
    modules: number;
  };
}

interface Student {
  id: string;
  name: string | null;
  email: string | null;
  groupId: string | null;
}

interface Module {
  id: string;
  title: string;
}

interface Trainer {
  id: string;
  name: string | null;
}

export default function StagiairesClient({ 
  initialGroups, 
  independentStudents, 
  allModules,
  assignedModuleIdsMap,
  availableTrainers = [],
  trainerId
}: { 
  initialGroups: Group[], 
  independentStudents: Student[],
  allModules: Module[],
  assignedModuleIdsMap: Record<string, string[]>,
  availableTrainers?: Trainer[],
  trainerId?: string
}) {
  const [isCreatingGroup, setIsCreatingGroup] = useState(false);
  const [activeGroupId, setActiveGroupId] = useState<string | null>(null);
  const [selectedModuleIds, setSelectedModuleIds] = useState<string[]>([]);
  const [isAssigning, setIsAssigning] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<string[]>([]);
  
  // States pour ajout rapide d'un élève
  const [addingToGroup, setAddingToGroup] = useState<string | null>(null);
  const [newStudentName, setNewStudentName] = useState("");
  const [newStudentEmail, setNewStudentEmail] = useState("");
  const [isAddingStudent, setIsAddingStudent] = useState(false);

  // States pour suppression
  const [showConfirmDelete, setShowConfirmDelete] = useState<{ id: string, type: 'group' | 'student', name: string, count?: number } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // States pour Invitation Globale
  const [isInviting, setIsInviting] = useState(false);
  const [invitationStep, setInvitationStep] = useState<'form' | 'success'>('form');
  const [lastInvitedEmail, setLastInvitedEmail] = useState("");
  const [inviteName, setInviteName] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteGroupId, setInviteGroupId] = useState("");

  const handleCreateGroup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    await createGroup(formData);
    setIsCreatingGroup(false);
    window.location.reload();
  };

  const openAssignmentModal = (groupId: string) => {
    setActiveGroupId(groupId);
    const preselected = assignedModuleIdsMap[groupId] || [];
    setSelectedModuleIds(preselected);
    setIsAssigning(true);
  };

  const handleSaveAssignment = async () => {
    if (!activeGroupId) return;
    setIsSubmitting(true);
    try {
      const result = await assignModulesToGroup(activeGroupId, selectedModuleIds);
      if (result.error) {
        alert(result.error);
      } else {
        setIsAssigning(false);
        window.location.reload();
      }
    } catch (err) {
      console.error(err);
      alert("Une erreur est survenue lors de la synchronisation.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleJoinGroup = async (studentId: string, groupId: string) => {
    await updateStudentGroup(studentId, groupId);
    window.location.reload();
  };

  const handleAssignTrainer = async (groupId: string, trainerId: string) => {
    await assignTrainerToGroup(groupId, trainerId === "none" ? null : trainerId);
    window.location.reload();
  };

  const toggleGroupExpansion = (groupId: string) => {
    setExpandedGroups(prev => 
      prev.includes(groupId) 
        ? prev.filter(id => id !== groupId) 
        : [...prev, groupId]
    );
  };

  const handleRemoveStudentFromGroup = async (studentId: string) => {
    if (!window.confirm("Voulez-vous vraiment retirer ce stagiaire du groupe ?")) return;
    await updateStudentGroup(studentId, null);
    window.location.reload();
  };

  const handleQuickAddStudent = async (groupId: string) => {
    if (!newStudentName || !newStudentEmail) {
      alert("Le nom et l'email sont requis.");
      return;
    }
    setIsAddingStudent(true);
    const res = await quickAddStudent(groupId, newStudentName, newStudentEmail, trainerId);
    if (res?.error) {
      alert(res.error);
    } else {
      setAddingToGroup(null);
      setNewStudentName("");
      setNewStudentEmail("");
      window.location.reload();
    }
    setIsAddingStudent(false);
  };

  const copyInvitationLink = (email: string) => {
    const baseUrl = window.location.origin;
    const link = `${baseUrl}/auth/login?email=${encodeURIComponent(email)}&auto=true`;
    navigator.clipboard.writeText(link);
    alert("Lien d'invitation copié !");
  };

  const handleGlobalInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteName || !inviteEmail || !inviteGroupId) {
      alert("Tous les champs sont requis.");
      return;
    }
    setIsSubmitting(true);
    const res = await quickAddStudent(inviteGroupId, inviteName, inviteEmail, trainerId);
    if (res?.error) {
      alert(res.error);
    } else {
      setLastInvitedEmail(inviteEmail);
      setInvitationStep('success');
    }
    setIsSubmitting(false);
  };

  const toggleModuleSelection = (moduleId: string) => {
    setSelectedModuleIds(prev => 
      prev.includes(moduleId) 
        ? prev.filter(id => id !== moduleId) 
        : [...prev, moduleId]
    );
  };

  const executeDelete = async () => {
    if (!showConfirmDelete) return;
    setIsDeleting(true);
    try {
      const endpoint = showConfirmDelete.type === 'group' 
        ? `/api/groups/${showConfirmDelete.id}` 
        : `/api/students/${showConfirmDelete.id}`;
      
      const res = await fetch(endpoint, { method: "DELETE" });
      if (res.ok) {
        window.location.reload();
      } else {
        alert("Erreur lors de la suppression.");
      }
    } catch (error) {
      console.error("Delete error:", error);
      alert("Une erreur est survenue.");
    } finally {
      setIsDeleting(false);
      setShowConfirmDelete(null);
    }
  };

  return (
    <div className="w-full space-y-12 pb-20">
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-12">
        {/* Colonne de Gauche : Groupes */}
        <div className="xl:col-span-2 space-y-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="flex items-center gap-3 text-sm font-black uppercase tracking-widest text-[#00f2ff]">
                  <Settings2 size={16} /> Groupes
              </h3>
              <button 
                onClick={() => setIsCreatingGroup(true)}
                className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 text-white rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-white/10 transition-all"
              >
                <Plus size={14} /> Nouveau
              </button>
            </div>

            <div className="grid grid-cols-1 gap-6">
                {initialGroups.map((group) => {
                    const isExpanded = expandedGroups.includes(group.id);
                    return (
                        <div key={group.id} className="glass-card overflow-hidden group hover:border-[#00f2ff]/30 transition-all">
                            <div className="p-8">
                                <div className="flex justify-between items-start mb-6">
                                    <div className="flex gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 group-hover:border-[#fbbf24]/40 transition-colors">
                                            <Users className="text-[#fbbf24]" size={24} />
                                        </div>
                                        <div>
                                            <h4 className="text-2xl font-black text-white leading-tight">{group.name}</h4>
                                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20">
                                                {group._count.users} Stagiaires • {group._count.modules} Modules
                                            </p>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center gap-3">
                                        {/* Bouton de suppression du groupe - ADMIN UNIQUEMENT */}
                                        {!trainerId && (
                                          <button 
                                            onClick={() => setShowConfirmDelete({ 
                                              id: group.id, 
                                              type: 'group', 
                                              name: group.name, 
                                              count: group._count.users 
                                            })}
                                            className="p-2.5 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-all"
                                            title="Supprimer le groupe"
                                          >
                                            <Trash2 size={18} />
                                          </button>
                                        )}

                                        {!trainerId && (
                                            <select 
                                                className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-[10px] font-black text-[#fbbf24] focus:ring-0 cursor-pointer uppercase tracking-widest"
                                                value={group.trainerId || "none"}
                                                onChange={(e) => handleAssignTrainer(group.id, e.target.value)}
                                            >
                                                <option value="none">SANS FORMATEUR</option>
                                                {availableTrainers.map(t => (
                                                    <option key={t.id} value={t.id}>{t.name?.toUpperCase() || "FORMATEUR SANS NOM"}</option>
                                                ))}
                                            </select>
                                        )}

                                        <button 
                                            onClick={() => toggleGroupExpansion(group.id)}
                                            className="p-2 text-white/20 hover:text-white transition-colors"
                                        >
                                            {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                        </button>
                                    </div>
                                </div>

                                <p className="text-sm text-white/40 mb-8 line-clamp-2">{group.description || "Aucune description."}</p>

                                <div className="flex gap-4">
                                    <button 
                                        onClick={() => openAssignmentModal(group.id)}
                                        className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black text-white hover:bg-white/10 transition-colors"
                                    >
                                        <Library size={14} /> BIBLIOTHÈQUE ({group._count.modules})
                                    </button>
                                </div>
                            </div>

                            {/* Liste des stagiaires (Expandable) */}
                            {isExpanded && (
                                <div className="bg-black/20 border-t border-white/5 p-8 animate-in slide-in-from-top-2 duration-300">
                                    <h5 className="text-[10px] font-black uppercase tracking-widest text-[#00f2ff] mb-4 flex items-center gap-2">
                                        <GraduationCap size={14} /> Liste des Stagiaires
                                    </h5>
                                    {(group.users || []).length === 0 ? (
                                        <p className="text-sm text-white/20 italic">Aucun stagiaire dans ce groupe.</p>
                                    ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {(group.users || []).map(u => (
                                                <div key={u.id} className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/5 relative group/student">
                                                    <div className="w-8 h-8 rounded-lg bg-[#fbbf24]/10 flex items-center justify-center text-[#fbbf24] text-[10px] font-black">
                                                        {u.name?.slice(0, 1) || u.email?.slice(0, 1)}
                                                    </div>
                                                    <div className="overflow-hidden pr-16 flex-1">
                                                        <p className="text-xs font-bold text-white truncate">{u.name || "Inconnu"}</p>
                                                        <p className="text-[9px] text-white/30 truncate uppercase">{u.email}</p>
                                                    </div>
                                                    <div className="absolute right-2 flex items-center gap-1 transition-all">
                                                      <button 
                                                          onClick={() => copyInvitationLink(u.email || "")}
                                                          className="p-1.5 text-[#00f2ff] hover:text-[#00f2ff]/80 transition-all"
                                                          title="Copier le lien d'invitation"
                                                      >
                                                          <LinkIcon size={14} />
                                                      </button>
                                                      <button 
                                                          onClick={() => handleRemoveStudentFromGroup(u.id)}
                                                          className="p-1.5 text-white/20 hover:text-white transition-all"
                                                          title="Retirer du groupe"
                                                      >
                                                          <X size={14} />
                                                      </button>
                                                      <button 
                                                          onClick={() => setShowConfirmDelete({ id: u.id, type: 'student', name: u.name || u.email || "Stagiaire" })}
                                                          className="p-1.5 text-red-500 hover:text-red-400"
                                                          title="Supprimer définitivement"
                                                      >
                                                          <Trash2 size={14} />
                                                      </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Interface d'ajout inline */}
                                    {addingToGroup === group.id ? (
                                        <div className="mt-6 p-5 bg-black/40 rounded-xl border border-[#fbbf24]/30">
                                            <h6 className="text-[10px] font-black uppercase text-[#fbbf24] mb-4">Inscrire un nouvel élève</h6>
                                            <div className="flex flex-col gap-3">
                                                <div className="relative group">
                                                    <Users className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-[#fbbf24] transition-colors" />
                                                    <input 
                                                        type="text" 
                                                        placeholder="Nom complet" 
                                                        value={newStudentName}
                                                        onChange={e => setNewStudentName(e.target.value)}
                                                        className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-4 text-sm text-white focus:outline-none focus:border-[#fbbf24]/50 transition-all"
                                                    />
                                                </div>
                                                <div className="relative group">
                                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-[#fbbf24] transition-colors" />
                                                    <input 
                                                        type="email" 
                                                        placeholder="Adresse Email" 
                                                        value={newStudentEmail}
                                                        onChange={e => setNewStudentEmail(e.target.value)}
                                                        className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-4 text-sm text-white focus:outline-none focus:border-[#fbbf24]/50 transition-all"
                                                    />
                                                </div>
                                                <div className="flex justify-end gap-3 mt-3">
                                                    <button 
                                                        onClick={() => setAddingToGroup(null)}
                                                        className="px-5 py-2 text-xs font-bold text-white/40 hover:text-white transition-colors"
                                                        disabled={isAddingStudent}
                                                    >
                                                        Annuler
                                                    </button>
                                                    <button 
                                                        onClick={() => handleQuickAddStudent(group.id)}
                                                        className="px-6 py-2 bg-[#fbbf24] text-[#132E53] text-[10px] font-black uppercase tracking-widest rounded-lg hover:scale-105 transition-all disabled:opacity-50"
                                                        disabled={isAddingStudent}
                                                    >
                                                        {isAddingStudent ? "Inscription..." : "Valider"}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <button 
                                            onClick={() => setAddingToGroup(group.id)}
                                            className="mt-6 w-full py-4 border border-dashed border-white/20 rounded-xl text-xs font-bold text-white/50 hover:text-[#fbbf24] hover:border-[#fbbf24]/50 transition-colors flex items-center justify-center gap-2"
                                        >
                                            <Plus size={16} /> Ajouter un stagiaire au groupe
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>

        {/* Colonne de Droite : Stagiaires Sans Groupe */}
        <div className="space-y-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="flex items-center gap-3 text-sm font-black uppercase tracking-widest text-[#fbbf24]">
                  <UserPlus size={16} /> Stagiaires
              </h3>
              <button 
                onClick={() => {
                  setInvitationStep('form');
                  setIsInviting(true);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-[#fbbf24]/10 border border-[#fbbf24]/20 text-[#fbbf24] rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-[#fbbf24]/20 transition-all"
              >
                <Plus size={14} /> Inviter
              </button>
            </div>

            <div className="glass-card p-6 divide-y divide-white/5">
                {independentStudents.length === 0 ? (
                    <p className="text-center py-10 text-white/20 italic text-sm">Tous les stagiaires sont assignés.</p>
                ) : (
                    independentStudents.map((student) => (
                        <div key={student.id} className="py-4 flex items-center justify-between group/wait">
                            <div className="max-w-[120px]">
                                <p className="font-bold text-white text-sm truncate">{student.name}</p>
                                <p className="text-[10px] text-white/30 uppercase font-medium truncate">{student.email}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <button 
                                  onClick={() => copyInvitationLink(student.email || "")}
                                  className="p-1.5 text-[#00f2ff]/60 hover:text-[#00f2ff] transition-all"
                                  title="Copier le lien d'invitation"
                              >
                                  <LinkIcon size={14} />
                              </button>
                              <select 
                                  className="bg-transparent border-none text-[10px] font-black text-[#00f2ff] focus:ring-0 cursor-pointer p-0"
                                  onChange={(e) => handleJoinGroup(student.id, e.target.value)}
                                  defaultValue=""
                              >
                                  <option value="" disabled>ASSIGNER</option>
                                  {initialGroups.map(g => (
                                      <option key={g.id} value={g.id}>{g.name}</option>
                                  ))}
                              </select>
                              <button 
                                  onClick={() => setShowConfirmDelete({ id: student.id, type: 'student', name: student.name || student.email || "Stagiaire" })}
                                  className="p-2 text-red-500 hover:text-red-400 transition-all"
                              >
                                  <Trash2 size={14} />
                              </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
      </div>

      {/* Global Deletion Modal (Centered Fixed Overlay) */}
      {showConfirmDelete && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div 
            className="absolute inset-0 bg-[#020617]/40 backdrop-blur-2xl"
            onClick={() => !isDeleting && setShowConfirmDelete(null)}
          />
          <div className="relative glass-card border-white/10 p-10 max-w-sm w-full text-center scale-100 animate-in zoom-in-95 duration-200 shadow-2xl">
            <div className="bg-red-500/20 w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-red-500/30">
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
            
            <h4 className="text-2xl font-bold text-white mb-3 tracking-tight">
              {showConfirmDelete.type === 'group' ? "Supprimer le groupe ?" : "Supprimer le stagiaire ?"}
            </h4>
            
            <div className="text-sm text-white/50 mb-8 leading-relaxed px-2">
              {showConfirmDelete.type === 'group' ? (
                <>
                  Cette action supprimera la cohorte <span className="text-white font-bold">"{showConfirmDelete.name}"</span>. 
                  {showConfirmDelete.count && showConfirmDelete.count > 0 ? (
                    <div className="mt-2 p-3 bg-red-500/10 rounded-xl border border-red-500/20 text-red-400">
                      Attention : <span className="font-bold">{showConfirmDelete.count} stagiaires</span> seront désassignés et redeviendront indépendants.
                    </div>
                  ) : (
                    " Les stagiaires éventuellement liés seront désassignés."
                  )}
                </>
              ) : (
                <>
                  Voulez-vous supprimer <span className="text-white font-bold">"{showConfirmDelete.name}"</span> ? 
                  Ses statistiques de progression seront <span className="text-red-400 font-bold">définitivement effacées</span>.
                </>
              )}
            </div>
            
            <div className="flex flex-col gap-3">
              <button 
                onClick={executeDelete}
                disabled={isDeleting}
                className="w-full py-4 rounded-2xl bg-red-600 text-white font-black hover:bg-red-500 transition-all shadow-lg shadow-red-900/40 active:scale-95 disabled:opacity-50"
              >
                {isDeleting ? (
                  <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                ) : (
                  "SUPPRIMER DÉFINITIVEMENT"
                )}
              </button>
              <button 
                onClick={() => setShowConfirmDelete(null)}
                disabled={isDeleting}
                className="w-full py-4 rounded-2xl bg-white/5 text-white/60 font-medium hover:bg-white/10 hover:text-white transition-all"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Création Groupe */}
      {isCreatingGroup && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-xl animate-in fade-in duration-300">
            <div className="glass-card w-full max-w-lg p-10 border-[#fbbf24]/20">
                <div className="flex justify-between items-center mb-10">
                    <h3 className="text-2xl font-black text-[#fbbf24]">Nouveau Groupe</h3>
                    <button onClick={() => setIsCreatingGroup(false)} className="text-white/20 hover:text-white transition-colors">
                        <X size={24} />
                    </button>
                </div>

                    <form onSubmit={handleCreateGroup} className="space-y-6">
                        {trainerId && <input type="hidden" name="trainerId" value={trainerId} />}
                        <div>
                        <label className="text-[10px] font-black uppercase text-white/40 tracking-widest block mb-2">Nom de la cohorte</label>
                        <input 
                            name="name" 
                            required 
                            className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-[#fbbf24]/50" 
                            placeholder="ex: Promotion Alpha 2024"
                        />
                    </div>
                    <div>
                        <label className="text-[10px] font-black uppercase text-white/40 tracking-widest block mb-2">Description locale</label>
                        <textarea 
                            name="description" 
                            rows={3} 
                            className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-[#fbbf24]/50 resize-none" 
                            placeholder="Brève description du groupe..."
                        />
                    </div>
                    <button className="w-full py-5 bg-[#fbbf24] text-[#132E53] rounded-2xl font-black uppercase tracking-[0.2em] shadow-[0_0_20px_rgba(251,191,36,0.3)]">
                        CRÉER LA COHORTE
                    </button>
                </form>
            </div>
        </div>
      )}

      {/* Modal Assignation Modules (Library) */}
      {isAssigning && activeGroupId && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-xl animate-in fade-in duration-300">
            <div className="glass-card w-full max-w-2xl p-10 border-[#00f2ff]/20">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h3 className="text-2xl font-black text-[#00f2ff]">Bibliothèque de Modules</h3>
                        <p className="text-sm text-white/40 font-medium">Assignez les contenus à {initialGroups.find(g => g.id === activeGroupId)?.name}</p>
                    </div>
                    <button onClick={() => setIsAssigning(false)} className="text-white/20 hover:text-white transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <div className="relative mb-6">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 w-4 h-4" />
                    <input 
                        type="text" 
                        placeholder="Rechercher un module..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-[#00f2ff]/50" 
                    />
                </div>

                <div className="max-h-[40vh] overflow-y-auto pr-2 space-y-2 custom-scrollbar">
                    {allModules
                        .filter(m => m.title.toLowerCase().includes(searchQuery.toLowerCase()))
                        .map((module) => {
                            const isSelected = selectedModuleIds.includes(module.id);
                            return (
                                <div 
                                    key={module.id} 
                                    onClick={() => toggleModuleSelection(module.id)}
                                    className={`p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between group ${
                                        isSelected 
                                            ? "bg-[#00f2ff]/10 border-[#00f2ff]/40" 
                                            : "bg-white/5 border-white/5 hover:border-white/20"
                                    }`}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`p-2 rounded-lg ${isSelected ? "text-[#00f2ff]" : "text-white/20"}`}>
                                            <BookOpen size={18} />
                                        </div>
                                        <span className={`font-bold transition-colors ${isSelected ? "text-[#00f2ff]" : "text-white/60"}`}>
                                            {module.title}
                                        </span>
                                    </div>
                                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                                        isSelected 
                                            ? "border-[#00f2ff] bg-[#00f2ff] text-[#132E53]" 
                                            : "border-white/10"
                                    }`}>
                                        {isSelected && <Check size={14} strokeWidth={4} />}
                                    </div>
                                </div>
                            );
                        })
                    }
                </div>

                <div className="mt-10 flex gap-4">
                    <button 
                        onClick={() => setIsAssigning(false)}
                        className="flex-1 py-4 text-white/40 font-bold hover:text-white transition-colors"
                    >
                        Annuler
                    </button>
                    <button 
                        onClick={handleSaveAssignment}
                        disabled={isSubmitting}
                        className="flex-[2] py-4 bg-[#00f2ff] text-[#132E53] rounded-2xl font-black uppercase tracking-[0.2em] shadow-[0_0_20px_rgba(0,242,255,0.3)] hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {isSubmitting ? (
                            <>
                                <span className="animate-spin inline-block w-4 h-4 border-2 border-[#132E53] border-t-transparent rounded-full" />
                                SYNCHRONISATION...
                            </>
                        ) : "SYNCHRONISER LES ACCÈS"}
                    </button>
                </div>
            </div>
        </div>
      )}

      {/* Modal d'Invitation Globale */}
      {isInviting && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-6 bg-black/80 backdrop-blur-xl animate-in fade-in duration-300">
          <div className="glass-card w-full max-w-md p-10 border-[#fbbf24]/20 relative">
            <button 
              onClick={() => {
                setIsInviting(false);
                if (invitationStep === 'success') window.location.reload();
              }} 
              className="absolute right-6 top-6 text-white/20 hover:text-white transition-colors"
            >
                <X size={24} />
            </button>

            {invitationStep === 'form' ? (
              <>
                <div className="mb-10">
                  <h3 className="text-2xl font-black text-[#fbbf24] mb-2">Inviter un stagiaire</h3>
                  <p className="text-sm text-white/40">Inscrivez un nouvel élève et générez son lien d'accès.</p>
                </div>

                <form onSubmit={handleGlobalInvite} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-white/40 tracking-widest ml-1">Nom complet</label>
                    <div className="relative group">
                      <Users className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-[#fbbf24] transition-colors" />
                      <input 
                        value={inviteName}
                        onChange={e => setInviteName(e.target.value)}
                        required
                        className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-4 text-white focus:outline-none focus:border-[#fbbf24]/50" 
                        placeholder="Prénom Nom"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-white/40 tracking-widest ml-1">Adresse Email</label>
                    <div className="relative group">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-[#fbbf24] transition-colors" />
                      <input 
                        type="email"
                        value={inviteEmail}
                        onChange={e => setInviteEmail(e.target.value)}
                        required
                        className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-4 text-white focus:outline-none focus:border-[#fbbf24]/50" 
                        placeholder="exemple@email.com"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-white/40 tracking-widest ml-1">Assigner à un groupe</label>
                    <div className="relative group">
                      <GraduationCap className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-[#fbbf24] transition-colors" />
                      <select 
                        value={inviteGroupId}
                        onChange={e => setInviteGroupId(e.target.value)}
                        required
                        className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-4 text-white focus:outline-none focus:border-[#fbbf24]/50 appearance-none uppercase text-xs font-black tracking-widest"
                      >
                        <option value="" disabled className="bg-[#0b1120]">CHOISIR UN GROUPE</option>
                        {initialGroups.map(g => (
                          <option key={g.id} value={g.id} className="bg-[#0b1120]">{g.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <button 
                    disabled={isSubmitting}
                    className="w-full py-5 bg-[#fbbf24] text-[#132E53] rounded-2xl font-black uppercase tracking-[0.2em] shadow-[0_0_30px_rgba(251,191,36,0.3)] hover:scale-105 transition-all disabled:opacity-50"
                  >
                    {isSubmitting ? "INSCRIPTION EN COURS..." : "CRÉER ET GÉNÉRER LE LIEN"}
                  </button>
                </form>
              </>
            ) : (
              <div className="text-center py-4">
                <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-8 border border-green-500/30">
                  <Check className="w-10 h-10 text-green-400" strokeWidth={3} />
                </div>
                
                <h3 className="text-2xl font-black text-white mb-2">Stagiaire inscrit !</h3>
                <p className="text-sm text-white/40 mb-10">Voici son lien d'accès personnel "Lien Magique" :</p>

                <div className="bg-black/40 border border-white/10 rounded-2xl p-6 mb-8 text-left relative group">
                  <p className="text-[10px] font-black text-[#00f2ff] uppercase tracking-widest mb-2">Lien de connexion directe</p>
                  <p className="text-xs text-white/60 break-all font-mono leading-relaxed">
                    {typeof window !== 'undefined' ? window.location.origin : ''}/auth/login?email={encodeURIComponent(lastInvitedEmail)}&auto=true
                  </p>
                </div>

                <div className="flex flex-col gap-4">
                  <button 
                    onClick={() => copyInvitationLink(lastInvitedEmail)}
                    className="w-full py-5 bg-[#00f2ff] text-[#132E53] rounded-2xl font-black uppercase tracking-[0.2em] shadow-[0_0_30px_rgba(0,242,255,0.3)] hover:scale-105 transition-all flex items-center justify-center gap-3"
                  >
                    <LinkIcon size={18} /> COPIER LE LIEN
                  </button>
                  <button 
                    onClick={() => {
                      setIsInviting(false);
                      window.location.reload();
                    }}
                    className="w-full py-4 text-white/40 font-bold hover:text-white transition-colors"
                  >
                    Fermer et actualiser
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
