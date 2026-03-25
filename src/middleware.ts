import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  
  // 1. Toujours autoriser les routes d'auth et de santé
  if (
    pathname.startsWith("/api/auth") || 
    pathname.startsWith("/auth/") ||
    pathname.startsWith("/register") ||
    pathname === "/api/health"
  ) {
    return NextResponse.next();
  }

  // 2. Assets statiques
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon.ico") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // 3. Récupération du secret
  const secret = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || "antigravity-dev-secret-key-change-in-production-2024";

  try {
    // getToken gère automatiquement la détection du cookie (Secure ou non)
    const token = await getToken({ 
      req, 
      secret,
    });

    if (!token) {
      // Pas de session -> redirection vers login
      const loginUrl = new URL("/auth/login", req.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }

    const role = (token.role as string || "STUDENT").toUpperCase();
    const isAdmin = role === "ADMIN";
    const isTrainer = role === "TRAINER";

    // 4. Protections spécifiques (Admin/Dashboard)
    if (pathname.startsWith("/admin")) {
      const trainerAllowedPaths = ["/admin/groups", "/admin/modules", "/admin/stagiaires", "/admin/upload", "/admin/profile", "/admin/settings", "/admin/dashboard"];
      const isAllowedForTrainer = trainerAllowedPaths.some(p => pathname.startsWith(p));

      if (!isAdmin && !(isTrainer && isAllowedForTrainer)) {
        return NextResponse.redirect(new URL(role === "STUDENT" ? "/catalogue" : "/admin/dashboard", req.url));
      }
    }

    if (pathname.startsWith("/dashboard") && !isAdmin && !isTrainer) {
      return NextResponse.redirect(new URL("/catalogue", req.url));
    }

  } catch (error) {
    console.error(">>> MIDDLEWARE JWT ERROR:", error);
    return NextResponse.redirect(new URL("/auth/login", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api/upload|_next/static|_next/image|favicon.ico).*)"],
};
