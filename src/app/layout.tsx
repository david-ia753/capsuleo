import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { SessionProvider } from "@/components/SessionProvider";
import { auth } from "@/auth";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Capsuléo",
  description: "Formation Innovante & Interactive — Votre espace pédagogique cristal",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  return (
    <html lang="fr" className="dark">
      <body 
        className={`${inter.variable} antialiased bg-[#020617] text-white min-h-screen relative`}
      >
        <div className="fixed inset-0 z-[-1] pointer-events-none overflow-hidden h-full w-full">
          {/* Finesse Radial Background */}
          <div className="absolute inset-0" style={{ background: "radial-gradient(circle at center, #1e3a8a 0%, #020617 100%)" }} />
          
          {/* Premium Animated Blobs */}
          <div className="absolute inset-0 z-0 opacity-40 blur-[120px]">
            <div className="absolute top-[10%] left-[20%] w-[40vw] h-[40vw] rounded-full bg-blue-600/30 animate-pulse" />
            <div className="absolute bottom-[20%] right-[10%] w-[50vw] h-[50vw] rounded-full bg-[#fbbf24]/10 animate-pulse delay-1000" />
            <div className="absolute top-[40%] right-[30%] w-[30vw] h-[30vw] rounded-full bg-cyan-400/10 animate-pulse delay-700" />
          </div>
        </div>

        <SessionProvider session={session}>
          <div className="relative z-10 w-full min-h-screen">
            {children}
          </div>
        </SessionProvider>
      </body>
    </html>
  );
}
