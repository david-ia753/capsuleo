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
    <div className="admin-layout text-white bg-transparent">
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

      {/* Main Content Spacer - Hidden on Mobile */}
      <div className="hidden lg:block w-72 min-w-[18rem]" />

      {/* Main Content Area */}
      <main className="flex-1 admin-content pt-20 lg:pt-8 min-h-screen">
        {children}
      </main>
    </div>
  );
}
