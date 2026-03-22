"use client";

import React from "react";
import { Sidebar } from "@/components/Sidebar";
import { MobileHeader } from "@/components/MobileHeader";

export default function AdminClientLayoutWrapper({
  children,
  session,
}: {
  children: React.ReactNode;
  session: any;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

  return (
    <div className="flex bg-[#020617] min-h-screen text-white">
      {/* Mobile Header */}
      <MobileHeader 
        isOpen={isSidebarOpen} 
        onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} 
      />

      {/* Admin Sidebar */}
      <Sidebar 
        session={session} 
        role="ADMIN" 
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <main className="flex-1 lg:ml-64 p-4 lg:p-8 pt-20 lg:pt-8 min-h-screen overflow-x-hidden">
        {children}
      </main>
    </div>
  );
}
