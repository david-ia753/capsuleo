import React from "react";
import { Sidebar } from "@/components/Sidebar";
import { SessionProvider } from "@/components/SessionProvider";
import { MobileHeader } from "@/components/MobileHeader";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import AdminClientLayoutWrapper from "./AdminClientLayoutWrapper";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/auth/signin");
  }

  return (
    <SessionProvider session={session}>
      <AdminClientLayoutWrapper session={session}>
        {children}
      </AdminClientLayoutWrapper>
    </SessionProvider>
  );
}
