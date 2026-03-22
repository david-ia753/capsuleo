import React from "react";
import { Sidebar } from "@/components/Sidebar";
import { SessionProvider } from "@/components/SessionProvider";
import { MobileHeader } from "@/components/MobileHeader";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import ClientLayoutWrapper from "./ClientLayoutWrapper";

export default async function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/auth/signin");
  }

  return (
    <SessionProvider session={session}>
      <ClientLayoutWrapper session={session}>
        {children}
      </ClientLayoutWrapper>
    </SessionProvider>
  );
}
