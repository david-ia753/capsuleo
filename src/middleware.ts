import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  
  // console.log(`>>> MIDDLEWARE START: ${pathname}`);

  // Routes publiques — pas de protection
  const publicRoutes = ["/auth/login", "/auth/error", "/register", "/auth/setup-password"];
  
  if (publicRoutes.some((route) => pathname === route || pathname.startsWith(route + "/"))) {
    return NextResponse.next();
  }

  // API auth — pas de protection
  if (pathname.startsWith("/api/auth")) {
    return NextResponse.next();
  }

  // Assets statiques — pas de protection
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon.ico") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // Utiliser getToken : gère automatiquement les cookies (Secure ou non), le secret et les sels.
  const token = await getToken({ 
    req, 
    secret: process.env.AUTH_SECRET,
    // Note: getToken extrait automatiquement le token du bon cookie
  });

  if (!token) {
    // console.log(`>>> MIDDLEWARE NO SESSION: Redirection vers login depuis ${pathname}`);
    const loginUrl = new URL("/auth/login", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // console.log(`>>> MIDDLEWARE SESSION FOUND: Role=${token.role} pour ${pathname}`);

  // Normalisation du rôle (sécurité sup)
  const role = token.role as string;
  const isAdmin = role === "ADMIN";
  const isTrainer = role === "TRAINER";

  // Protection /admin - ADMIN et TRAINER (pour les routes de gestion partagées)
  if (pathname.startsWith("/admin")) {
    const isTrainerAllowedRoute = 
      pathname.startsWith("/admin/groups") || 
      pathname.startsWith("/admin/modules") || 
      pathname.startsWith("/admin/stagiaires") || 
      pathname.startsWith("/admin/upload") ||
      pathname.startsWith("/admin/profile") ||
      pathname.startsWith("/admin/settings") || // AJOUTÉ
      pathname === "/admin/dashboard";

    if (!isAdmin && !(isTrainer && isTrainerAllowedRoute)) {
      // Si c'est un stagiaire ou un formateur sur une route non autorisée
      const redirectUrl = role === "STUDENT" ? "/catalogue" : "/admin/dashboard";
      return NextResponse.redirect(new URL(redirectUrl, req.url));
    }
  }

  // Protection /dashboard (Trainer) - ADMIN ou TRAINER uniquement
  if (pathname === "/dashboard" || pathname.startsWith("/dashboard/")) {
    if (!isAdmin && !isTrainer) {
      return NextResponse.redirect(new URL("/catalogue", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api/upload|_next/static|_next/image|favicon.ico).*)"],
};
