import React from "react";
import { Sidebar } from "@/components/Sidebar";
import { SessionProvider } from "@/components/SessionProvider";
import { MobileHeader } from "@/components/MobileHeader";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import AdminClientLayoutWrapper from "../admin/AdminClientLayoutWrapper";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "TRAINER")) {
    redirect("/auth/login");
  }

  // Use the same robust layout as admin
  return (
    <SessionProvider session={session}>
      <AdminClientLayoutWrapper session={session}>
        {children}
      </AdminClientLayoutWrapper>
    </SessionProvider>
  );
}
