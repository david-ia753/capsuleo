"use client";

import { useState } from "react";
import { 
  Bell, 
  Moon, 
  Sun, 
  Shield, 
  Globe, 
  CheckCircle,
  Loader2
} from "lucide-react";

export function SettingsForm({ user }: { user: any }) {
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const [notifications, setNotifications] = useState(true);
  const [theme, setTheme] = useState("dark");
  const [language, setLanguage] = useState("fr");

  const handleSave = async () => {
    setIsSaving(true);
    setMessage({ type: "", text: "" });
    
    // Simulate API call
    setTimeout(() => {
      setIsSaving(false);
      setMessage({ type: "success", text: "Préférences enregistrées avec succès." });
    }, 1000);
  };

  return (
    <div className="space-y-10">
      {/* 1. Apparence */}
      <section className="space-y-6">
        <div className="flex items-center gap-3 border-b border-white/5 pb-4">
          <Moon className="text-[#fbbf24]" size={20} />
          <h3 className="text-xl font-bold text-white">Apparence</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button 
            onClick={() => setTheme("dark")}
            className={`p-4 rounded-2xl border transition-all text-left ${
              theme === "dark" 
                ? "bg-[#fbbf24]/10 border-[#fbbf24]/40 text-white" 
                : "bg-white/5 border-white/10 text-white/40 hover:bg-white/10"
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <Moon size={20} />
              {theme === "dark" && <CheckCircle size={16} className="text-[#fbbf24]" />}
            </div>
            <p className="font-bold">Mode Sombre</p>
            <p className="text-[10px] uppercase tracking-widest font-black opacity-40 mt-1">Recommandé</p>
          </button>

          <button 
            onClick={() => setTheme("light")}
            className={`p-4 rounded-2xl border transition-all text-left ${
              theme === "light" 
                ? "bg-white/10 border-white/40 text-white" 
                : "bg-white/5 border-white/10 text-white/40 hover:bg-white/10"
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <Sun size={20} />
              {theme === "light" && <CheckCircle size={16} className="text-white" />}
            </div>
            <p className="font-bold">Mode Clair</p>
            <p className="text-[10px] uppercase tracking-widest font-black opacity-40 mt-1">Standard</p>
          </button>
        </div>
      </section>

      {/* 2. Notifications */}
      <section className="space-y-6">
        <div className="flex items-center gap-3 border-b border-white/5 pb-4">
          <Bell className="text-[#fbbf24]" size={20} />
          <h3 className="text-xl font-bold text-white">Notifications</h3>
        </div>
        
        <div className="flex items-center justify-between p-6 bg-white/5 rounded-2xl border border-white/10">
          <div>
            <p className="font-bold text-white">Alertes par email</p>
            <p className="text-sm text-white/40">Recevoir un récapitulatif de votre progression</p>
          </div>
          <button 
            onClick={() => setNotifications(!notifications)}
            className={`w-14 h-8 rounded-full transition-all relative ${
              notifications ? "bg-[#fbbf24]" : "bg-white/10"
            }`}
          >
            <div className={`absolute top-1 w-6 h-6 rounded-full bg-white transition-all shadow-lg ${
              notifications ? "left-7" : "left-1"
            }`} />
          </button>
        </div>
      </section>

      {/* 3. Langue */}
      <section className="space-y-6">
        <div className="flex items-center gap-3 border-b border-white/5 pb-4">
          <Globe className="text-[#fbbf24]" size={20} />
          <h3 className="text-xl font-bold text-white">Langue & Région</h3>
        </div>
        
        <select 
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          className="w-full px-4 py-4 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#fbbf24]/40 transition-all font-medium appearance-none"
        >
          <option value="fr">Français (France)</option>
          <option value="en">English (US)</option>
        </select>
      </section>

      {/* 4. Footer Actions */}
      <div className="pt-6 border-t border-white/5 flex flex-col gap-4">
        {message.text && (
          <div className="p-4 rounded-xl bg-green-500/10 text-green-400 text-sm flex items-center gap-3 animate-in slide-in-from-bottom-2">
            <CheckCircle size={18} />
            {message.text}
          </div>
        )}
        
        <button 
          onClick={handleSave}
          disabled={isSaving}
          className="w-full py-4 bg-[#fbbf24] hover:bg-[#f59e0b] text-marine font-black uppercase tracking-widest text-xs rounded-2xl transition-all active:scale-[0.98] flex items-center justify-center gap-3 disabled:opacity-50"
        >
          {isSaving ? <Loader2 className="animate-spin" size={18} /> : "Enregistrer les préférences"}
        </button>
      </div>
    </div>
  );
}
