import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  
  // 1. Routes publiques (toujours autorisées)
  const publicRoutes = ["/auth/login", "/auth/error", "/register", "/auth/setup-password", "/api/auth"];
  if (publicRoutes.some((route) => pathname === route || pathname.startsWith(route + "/"))) {
    return NextResponse.next();
  }

  // 2. Assets et fichiers statiques
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon.ico") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // 3. Détection du cookie de session (NextAuth v5 / Auth.js)
  const isProd = process.env.NODE_ENV === "production";
  const cookieName = isProd ? "__Secure-authjs.session-token" : "authjs.session-token";
  
  const secret = process.env.AUTH_SECRET || "antigravity-dev-secret-key-change-in-production-2024";

  try {
    const token = await getToken({ 
      req, 
      secret,
      salt: cookieName, // Forcer le salt basé sur le nom du cookie
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

    // 4. Protection /admin - réservé ADMIN et TRAINER (sur routes limitées)
    if (pathname.startsWith("/admin")) {
      const trainerAllowedPaths = [
        "/admin/groups", 
        "/admin/modules", 
        "/admin/stagiaires", 
        "/admin/upload", 
        "/admin/profile", 
        "/admin/settings",
        "/admin/dashboard"
      ];
      
      const isAllowedForTrainer = trainerAllowedPaths.some(p => pathname.startsWith(p));

      if (!isAdmin && !(isTrainer && isAllowedForTrainer)) {
        const redirectUrl = role === "STUDENT" ? "/catalogue" : "/admin/dashboard";
        return NextResponse.redirect(new URL(redirectUrl, req.url));
      }
    }

    // 5. Protection /dashboard (Formateur)
    if (pathname.startsWith("/dashboard")) {
      if (!isAdmin && !isTrainer) {
        return NextResponse.redirect(new URL("/catalogue", req.url));
      }
    }

  } catch (error) {
    console.error("Middleware Error:", error);
    // En cas d'erreur critique de décodage, on redirige vers login pour forcer une nouvelle session
    const loginUrl = new URL("/auth/login", req.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api/upload|_next/static|_next/image|favicon.ico).*)"],
};
