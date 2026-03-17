import { redirect } from "next/navigation";
import { auth } from "@/auth";

export default async function Home() {
  const session = await auth();

  if (session?.user) {
    // Redirection basée sur le rôle
    if (session.user.role === "ADMIN") {
      redirect("/admin/dashboard");
    } else if (session.user.role === "TRAINER") {
      redirect("/dashboard");
    } else {
      redirect("/catalogue");
    }
  }

  // Non connecté → page login
  redirect("/auth/login");
}
