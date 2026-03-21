"use client";

import { useState, useEffect } from "react";
import { getPendingUsers, approveUser, rejectUser } from "@/app/actions/students";
import { UserCheck, UserX, Clock, Mail, Calendar, Search, Loader2, CheckCircle2, XCircle, Shield } from "lucide-react";

export default function ApprovalsPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    const data = await getPendingUsers();
    setUsers(data);
    setLoading(false);
  };

  const handleApprove = async (userId: string) => {
    setProcessingId(userId);
    const result = await approveUser(userId);
    if (result.success) {
      setUsers(users.filter(u => u.id !== userId));
    } else {
      alert("Erreur lors de l'approbation");
    }
    setProcessingId(null);
  };

  const handleReject = async (userId: string) => {
    if (!confirm("Êtes-vous sûr de vouloir rejeter cette inscription ?")) return;
    setProcessingId(userId);
    const result = await rejectUser(userId);
    if (result.success) {
      setUsers(users.filter(u => u.id !== userId));
    } else {
      alert("Erreur lors du rejet");
    }
    setProcessingId(null);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto min-h-screen">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div>
          <h1 className="text-4xl font-black text-white mb-2 flex items-center gap-4">
            <span className="bg-safran/10 p-3 rounded-2xl text-safran">
              <Shield className="w-8 h-8" />
            </span>
            Validation des Inscriptions
          </h1>
          <p className="text-white/40 font-medium">Gérez les demandes d'accès à la plateforme</p>
        </div>
        
        <div className="flex items-center gap-3 bg-white/5 border border-white/10 px-6 py-3 rounded-2xl">
          <Clock className="w-5 h-5 text-safran" />
          <span className="text-white font-bold">{users.length}</span>
          <span className="text-white/40 text-sm uppercase tracking-widest font-black">Demandes en attente</span>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 gap-4">
          <Loader2 className="w-12 h-12 text-safran animate-spin" />
          <p className="text-white/20 uppercase tracking-[0.3em] font-black text-xs">Chargement des dossiers...</p>
        </div>
      ) : users.length === 0 ? (
        <div className="glass-card p-20 text-center border-white/5">
          <div className="mx-auto w-24 h-24 bg-green-500/10 rounded-full flex items-center justify-center mb-8 border border-green-500/20">
            <CheckCircle2 className="w-12 h-12 text-green-400" />
          </div>
          <h2 className="text-2xl font-black text-white mb-2">Tout est à jour !</h2>
          <p className="text-white/40 max-w-md mx-auto leading-relaxed">
            Il n'y a actuellement aucune demande d'inscription en attente de validation.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {users.map((user) => (
            <div key={user.id} className="glass-card p-8 border-white/10 hover:border-safran/30 transition-all group relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-safran/5 blur-3xl rounded-full -mr-16 -mt-16 group-hover:bg-safran/15 transition-all" />
              
              <div className="flex items-start justify-between gap-4 relative z-10">
                <div className="flex items-center gap-5">
                  <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10 text-white group-hover:bg-safran/10 group-hover:border-safran/30 transition-all">
                    <User className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-white mb-1 group-hover:text-safran transition-colors">{user.name}</h3>
                    <div className="flex items-center gap-2 text-white/40 text-sm font-medium">
                      <Mail className="w-3.5 h-3.5" />
                      {user.email}
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <span className="inline-block px-3 py-1 bg-white/5 border border-white/10 rounded-lg text-[10px] font-black text-white/40 uppercase tracking-widest">
                    {new Date(user.createdAt).toLocaleDateString('fr-FR')}
                  </span>
                </div>
              </div>

              <div className="mt-8 pt-8 border-t border-white/5 flex items-center gap-4 relative z-10">
                <button
                  onClick={() => handleApprove(user.id)}
                  disabled={processingId === user.id}
                  className="flex-1 py-4 bg-safran hover:bg-safran-light disabled:opacity-50 text-marine font-black uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2"
                >
                  {processingId === user.id ? <Loader2 className="w-5 h-5 animate-spin" /> : <UserCheck className="w-5 h-5" />}
                  Approuver
                </button>
                <button
                  onClick={() => handleReject(user.id)}
                  disabled={processingId === user.id}
                  className="px-6 py-4 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-xl transition-all flex items-center justify-center group/btn"
                >
                  <UserX className="w-5 h-5 group-hover/btn:scale-110 transition-transform" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Composant icone interne car pas importé
function User(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}
