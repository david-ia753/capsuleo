"use client";

import React from "react";
import { Sidebar } from "@/components/Sidebar";
import { SessionProvider } from "@/components/SessionProvider";
import { MobileHeader } from "@/components/MobileHeader";

export default function StagiaireLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
  const [session, setSession] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    fetch("/api/auth/session")
      .then(res => res.json())
      .then(data => {
        setSession(data);
        setLoading(false);
      });
  }, []);

  if (loading) return null;

  return (
    <SessionProvider session={session}>
      <div className="stagiaire-layout min-h-screen text-white bg-transparent flex flex-col lg:flex-row">
        {/* Mobile Header */}
        <MobileHeader 
          isOpen={isSidebarOpen} 
          onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} 
        />

        {/* Sidebar Component */}
        <Sidebar 
          session={session} 
          role={(session?.user?.role as any) || "STUDENT"} 
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />

        {/* Main Content Spacer - Hidden on Mobile */}
        <div className="hidden lg:block w-[280px] min-w-[280px]" />

        {/* Main Content Area */}
        <main className="flex-1 pt-24 lg:pt-20 px-4 lg:px-10 pb-12 overflow-y-auto no-scrollbar bg-transparent">
          {children}
        </main>
      </div>
    </SessionProvider>
  );
}
