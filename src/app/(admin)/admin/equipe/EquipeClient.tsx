"use client";

import { useState } from "react";
import { UserPlus, Mail, Shield, Clock, Send, Users, Trash2, AlertTriangle, Loader2 } from "lucide-react";
import { inviteMember } from "@/app/actions/equipe";

interface Member {
  id: string;
  name: string | null;
  email: string | null;
  role: string;
  createdAt: Date;
}

interface Invitation {
  id: string;
  email: string;
  status: string;
  createdAt: Date;
}

export default function EquipeClient({ 
  members, 
  invitations 
}: { 
  members: Member[], 
  invitations: Invitation[] 
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState<{ id: string, name: string } | null>(null);

  const handleInvite = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    const result = await inviteMember(formData);
    
    if (result.error) {
      alert(result.error);
    } else {
      (e.target as HTMLFormElement).reset();
      window.location.reload();
    }
    setIsSubmitting(false);
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      const res = await fetch(`/api/trainers/${id}`, { method: "DELETE" });
      if (res.ok) {
        window.location.reload();
      } else {
        const data = await res.json();
        alert(data.error || "Erreur lors de la suppression.");
      }
    } catch (error) {
      console.error(error);
      alert("Une erreur est survenue.");
    } finally {
      setDeletingId(null);
      setShowConfirm(null);
    }
  };

  return (
    <div className="w-full space-y-12 pb-20 pt-20">
      {/* Header */}
      <header className="mb-16 mt-20">
        <h2 
          className="text-5xl font-black"
          style={{ 
            color: "#fbbf24",
            letterSpacing: "-0.04em", 
            textShadow: "0 0 15px rgba(251, 191, 36, 0.5)" 
          }}
        >
          Gestion d'équipe
        </h2>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-12">
        {/* Colonne Gauche: Membres Actifs */}
        <div className="xl:col-span-2 space-y-8">
            <h3 className="flex items-center gap-3 text-sm font-black uppercase tracking-widest text-[#00f2ff]">
                <Shield size={16} /> Membres de l'Équipe
            </h3>

            <div className="glass-card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="border-b border-white/5 bg-white/5">
                                <th className="text-left p-6 text-[10px] font-black uppercase tracking-widest text-white/40">Membre</th>
                                <th className="text-left p-6 text-[10px] font-black uppercase tracking-widest text-white/40">Rôle</th>
                                <th className="text-left p-6 text-[10px] font-black uppercase tracking-widest text-white/40">Arrivée</th>
                                <th className="text-right p-6 text-[10px] font-black uppercase tracking-widest text-white/40">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {members.map((member) => (
                                <tr key={member.id} className="hover:bg-white/[0.02] transition-colors">
                                    <td className="p-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-[#fbbf24] font-black">
                                                {member.name?.slice(0, 1) || member.email?.slice(0, 1)}
                                            </div>
                                            <div>
                                                <p className="font-bold text-white leading-none mb-1">{member.name || "En attente"}</p>
                                                <p className="text-[10px] text-white/30 uppercase tracking-tighter">{member.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-6">
                                        <span className={`text-[10px] font-black uppercase px-3 py-1.5 rounded-lg border tracking-[0.1em] ${
                                            member.role === "ADMIN" 
                                            ? "border-[#fbbf24]/30 text-[#fbbf24] bg-[#fbbf24]/5" 
                                            : "border-[#00f2ff]/30 text-[#00f2ff] bg-[#00f2ff]/5"
                                        }`}>
                                            {member.role}
                                        </span>
                                    </td>
                                    <td className="p-6 text-sm text-white/40 font-medium">
                                        {new Date(member.createdAt).toLocaleDateString('fr-FR', {
                                            day: 'numeric',
                                            month: 'short',
                                            year: 'numeric'
                                        })}
                                    </td>
                                    <td className="p-6 text-right">
                                        {member.role !== "ADMIN" && (
                                            <button 
                                                onClick={() => setShowConfirm({ id: member.id, name: member.name || member.email || "Formateur" })}
                                                className="p-2.5 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-all border border-red-500/10"
                                                title="Supprimer le membre"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>

        {/* Colonne Droite: Invitation */}
        <div className="space-y-8">
          <h3 className="flex items-center gap-3 text-sm font-black uppercase tracking-widest text-[#fbbf24]">
            <UserPlus size={16} /> Inviter un Formateur
          </h3>
          
          <div className="glass-card p-8">
            <form onSubmit={handleInvite} className="space-y-6">
              <p className="text-sm text-white/40 leading-relaxed md:pr-4">
                Envoyez une invitation par email pour ajouter un nouveau formateur à l'équipe Capsuléo.
              </p>
              
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-white/40 tracking-widest block">Adresse Email</label>
                <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                    <input 
                        name="email"
                        type="email"
                        required
                        className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#fbbf24]/50 transition-colors"
                        placeholder="formateur@exemple.com"
                    />
                </div>
              </div>

              <button 
                type="submit"
                disabled={isSubmitting}
                className="w-full py-5 bg-[#fbbf24] text-[#132E53] rounded-2xl font-black uppercase tracking-[0.2em] shadow-[0_0_20px_rgba(251,191,36,0.2)] hover:scale-[1.02] transition-all disabled:opacity-50 flex items-center justify-center gap-3"
              >
                {isSubmitting ? "ENVOI..." : <><Send size={18} /> ENVOYER L'INVITATION</>}
              </button>
            </form>
          </div>

          {invitations.length > 0 && (
            <div className="space-y-6 pt-4">
              <h3 className="flex items-center gap-3 text-sm font-black uppercase tracking-widest text-white/20">
                <Clock size={16} /> Invitations en attente
              </h3>
              <div className="space-y-3">
                {invitations.map(inv => (
                  <div key={inv.id} className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5">
                    <span className="text-sm font-medium text-white/60 truncate pr-4">{inv.email}</span>
                    <span className="text-[9px] font-black uppercase bg-white/10 px-2 py-1 rounded text-white/40 tracking-widest">En attente</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div 
            className="absolute inset-0 bg-[#020617]/40 backdrop-blur-2xl"
            onClick={() => !deletingId && setShowConfirm(null)}
          />
          <div className="relative glass-card border-white/10 p-10 max-w-sm w-full text-center scale-100 animate-in zoom-in-95 duration-200 shadow-2xl">
            <div className="bg-red-500/20 w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-red-500/30">
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
            
            <h4 className="text-2xl font-bold text-white mb-3 tracking-tight">Supprimer le membre ?</h4>
            <p className="text-sm text-white/50 mb-8 leading-relaxed px-2">
              Voulez-vous vraiment supprimer <span className="text-white font-bold">"{showConfirm.name}"</span> ? 
              Ses groupes seront conservés mais n'auront plus de formateur assigné.
            </p>
            
            <div className="flex flex-col gap-3">
              <button 
                onClick={() => handleDelete(showConfirm.id)}
                disabled={!!deletingId}
                className="w-full py-4 rounded-2xl bg-red-600 text-white font-black hover:bg-red-500 transition-all shadow-lg shadow-red-900/40 active:scale-95 disabled:opacity-50"
              >
                {deletingId ? (
                  <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                ) : (
                  "SUPPRIMER DÉFINITIVEMENT"
                )}
              </button>
              <button 
                onClick={() => setShowConfirm(null)}
                disabled={!!deletingId}
                className="w-full py-4 rounded-2xl bg-white/5 text-white/60 font-medium hover:bg-white/10 hover:text-white transition-all"
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
