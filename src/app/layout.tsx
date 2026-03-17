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
        className={`${inter.variable} antialiased`}
        style={{
          background: "radial-gradient(circle at center, #1e3a8a 0%, #020617 100%)",
          backgroundAttachment: "fixed",
          backgroundColor: "#020617",
          minHeight: "100vh",
          margin: 0,
          color: "white"
        }}
      >
        <SessionProvider session={session}>
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}
