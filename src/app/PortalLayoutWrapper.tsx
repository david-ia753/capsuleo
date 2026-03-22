import React from "react";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { SessionProvider } from "@/components/SessionProvider";
import ClientLayoutWrapper from "./ClientLayoutWrapper";

export default async function PortalLayoutWrapper({
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
