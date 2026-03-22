"use client";

import { Copy, Check } from "lucide-react";
import { useState } from "react";

export default function CopyInvitationLink({ token }: { token: string }) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    const url = `${window.location.origin}/register?token=${token}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={copyToClipboard}
      className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-safran/10 text-safran hover:bg-safran/20 transition-all text-xs font-bold uppercase tracking-wider"
      title="Copier le lien d'inscription"
    >
      {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
      {copied ? "Copié !" : "Lien"}
    </button>
  );
}
