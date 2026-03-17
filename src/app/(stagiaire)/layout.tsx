import { auth } from "@/auth";
import { Sidebar } from "@/components/Sidebar";
import { SessionProvider } from "@/components/SessionProvider";

export default async function StagiaireLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  return (
    <SessionProvider session={session}>
      <div className="flex min-h-screen bg-transparent text-white">
        {/* Shared Sidebar Component */}
        <Sidebar session={session} role={(session?.user?.role as any) || "STUDENT"} />

        {/* Main Content Spacer for Fixed Sidebar */}
        <div style={{ width: "280px", minWidth: "280px" }} />

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto bg-transparent">
          {children}
        </main>
      </div>
    </SessionProvider>
  );
}
