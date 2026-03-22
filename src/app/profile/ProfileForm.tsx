"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { User, Mail, Lock, Loader2, CheckCircle, AlertCircle } from "lucide-react";

export function ProfileForm() {
  const { data: session, update } = useSession();
  const [firstName, setFirstName] = useState(session?.user?.firstName || "");
  const [lastName, setLastName] = useState(session?.user?.lastName || "");
  const [email, setEmail] = useState(session?.user?.email || "");
  
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [profileMessage, setProfileMessage] = useState({ type: "", text: "" });
  const [passwordMessage, setPasswordMessage] = useState({ type: "", text: "" });

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdatingProfile(true);
    setProfileMessage({ type: "", text: "" });

    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firstName, lastName, email }),
      });

      if (res.ok) {
        await update({ firstName, lastName, email });
        setProfileMessage({ type: "success", text: "Profil mis à jour avec succès." });
      } else {
        const data = await res.json();
        setProfileMessage({ type: "error", text: data.error || "Une erreur est survenue." });
      }
    } catch {
      setProfileMessage({ type: "error", text: "Erreur de connexion." });
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setPasswordMessage({ type: "error", text: "Les mots de passe ne correspondent pas." });
      return;
    }

    setIsUpdatingPassword(true);
    setPasswordMessage({ type: "", text: "" });

    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      if (res.ok) {
        setPasswordMessage({ type: "success", text: "Mot de passe mis à jour." });
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        const data = await res.json();
        setPasswordMessage({ type: "error", text: data.error || "Une erreur est survenue." });
      }
    } catch {
      setPasswordMessage({ type: "error", text: "Erreur de connexion." });
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Informations personnelles */}
      <div className="glass-card p-8 border-white/10 space-y-6">
        <div className="flex items-center gap-3 border-b border-white/5 pb-4">
          <User className="text-[#fbbf24]" size={20} />
          <h3 className="text-xl font-bold text-white">Informations Personnelles</h3>
        </div>

        <form onSubmit={handleUpdateProfile} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-white/40 ml-1">Prénom</label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#fbbf24]/40 transition-all font-medium"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-white/40 ml-1">Nom</label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#fbbf24]/40 transition-all font-medium"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-white/40 ml-1">Adresse Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" size={16} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#fbbf24]/40 transition-all font-medium"
              />
            </div>
          </div>

          {profileMessage.text && (
            <div className={`p-3 rounded-lg text-xs flex items-center gap-2 ${
              profileMessage.type === "success" ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"
            }`}>
              {profileMessage.type === "success" ? <CheckCircle size={14} /> : <AlertCircle size={14} />}
              {profileMessage.text}
            </div>
          )}

          <button
            type="submit"
            disabled={isUpdatingProfile}
            className="w-full py-3 bg-[#fbbf24] hover:bg-[#f59e0b] text-marine font-bold rounded-xl transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isUpdatingProfile ? <Loader2 className="animate-spin" size={18} /> : "Enregistrer les modifications"}
          </button>
        </form>
      </div>

      {/* Mot de passe */}
      <div className="glass-card p-8 border-white/10 space-y-6">
        <div className="flex items-center gap-3 border-b border-white/5 pb-4">
          <Lock className="text-[#fbbf24]" size={20} />
          <h3 className="text-xl font-bold text-white">Changer le mot de passe</h3>
        </div>

        <form onSubmit={handleChangePassword} className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-white/40 ml-1">Mot de passe actuel</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#fbbf24]/40 transition-all font-medium"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-white/40 ml-1">Nouveau mot de passe</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#fbbf24]/40 transition-all font-medium"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-white/40 ml-1">Confirmer le nouveau mot de passe</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#fbbf24]/40 transition-all font-medium"
            />
          </div>

          {passwordMessage.text && (
            <div className={`p-3 rounded-lg text-xs flex items-center gap-2 ${
              passwordMessage.type === "success" ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"
            }`}>
              {passwordMessage.type === "success" ? <CheckCircle size={14} /> : <AlertCircle size={14} />}
              {passwordMessage.text}
            </div>
          )}

          <button
            type="submit"
            disabled={isUpdatingPassword}
            className="w-full py-3 border border-[#fbbf24] text-[#fbbf24] hover:bg-[#fbbf24]/10 font-bold rounded-xl transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isUpdatingPassword ? <Loader2 className="animate-spin" size={18} /> : "Mettre à jour le mot de passe"}
          </button>
        </form>
      </div>
    </div>
  );
}
