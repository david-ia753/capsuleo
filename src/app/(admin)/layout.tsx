import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/Sidebar";
import { SessionProvider } from "@/components/SessionProvider";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/auth/login");
  }

  return (
    <SessionProvider session={session}>
      <div className="admin-layout min-h-screen text-white bg-transparent flex">
        {/* Sidebar Component */}
        <Sidebar session={session} role={session.user.role as any} />

        {/* Main Content Spacer for Fixed Sidebar */}
        <div style={{ width: "280px", minWidth: "280px" }} />

        {/* Main Content Area */}
        <main className="flex-1 pt-0 px-10 pb-10 overflow-y-auto bg-transparent">
          {children}
        </main>
      </div>
    </SessionProvider>
  );
}
