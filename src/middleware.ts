import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { decode } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  
  console.log(`>>> MIDDLEWARE START: ${pathname}`);

  // Routes publiques — pas de protection
  const publicRoutes = ["/auth/login", "/auth/error", "/register"];
  
  if (publicRoutes.some((route) => pathname === route || pathname.startsWith(route + "/"))) {
    console.log(`>>> MIDDLEWARE PUBLIC: ${pathname} est autorisé.`);
    return NextResponse.next();
  }

  // API auth — pas de protection
  if (pathname.startsWith("/api/auth")) {
    console.log(`>>> MIDDLEWARE API AUTH: ${pathname} est autorisé.`);
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

  console.log(`>>> MIDDLEWARE PROTECTED: Vérification de session pour ${pathname}`);

  // Lire le token JWT depuis le cookie
  const cookieName = process.env.NODE_ENV === "production"
    ? "__Secure-authjs.session-token"
    : "authjs.session-token";

  const sessionCookie = req.cookies.get(cookieName);

  if (!sessionCookie?.value) {
    console.log(`>>> MIDDLEWARE NO SESSION: Redirection vers login depuis ${pathname}`);
    const loginUrl = new URL("/auth/login", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Décoder le token JWT
  try {
    const token = await decode({
      token: sessionCookie.value,
      secret: process.env.AUTH_SECRET!,
      salt: cookieName,
    });

    if (!token) {
      console.log(`>>> MIDDLEWARE INVALID TOKEN: Redirection vers login depuis ${pathname}`);
      const loginUrl = new URL("/auth/login", req.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }

    console.log(`>>> MIDDLEWARE SESSION FOUND: Role=${token.role} pour ${pathname}`);
 
    // Protection /admin - ADMIN et TRAINER (pour les routes de gestion partagées)
    if (pathname.startsWith("/admin")) {
      const isTrainerRoute = pathname.startsWith("/admin/groups") || 
                             pathname.startsWith("/admin/modules") || 
                             pathname.startsWith("/admin/stagiaires") || 
                             pathname.startsWith("/admin/upload") ||
                             pathname.startsWith("/admin/profile") ||
                             pathname === "/admin/dashboard"; // Les formateurs n'utilisent normalement pas /admin/dashboard mais on autorise au cas où

      if (token.role !== "ADMIN" && !(token.role === "TRAINER" && isTrainerRoute)) {
        console.log(`>>> MIDDLEWARE UNAUTHORIZED ADMIN: ${token.role} tente d'accéder à ${pathname}`);
        return NextResponse.redirect(new URL(token.role === "STUDENT" ? "/catalogue" : "/dashboard", req.url));
      }
    }

    // Protection /dashboard (Trainer) - ADMIN ou TRAINER uniquement
    if (pathname === "/dashboard" || pathname.startsWith("/dashboard/")) {
      if (token.role !== "ADMIN" && token.role !== "TRAINER") {
        console.log(`>>> MIDDLEWARE UNAUTHORIZED TRAINER: ${token.role} tente d'accéder à ${pathname}`);
        return NextResponse.redirect(new URL("/catalogue", req.url));
      }
    }
  } catch (error) {
    console.log(`>>> MIDDLEWARE ERROR: ${error}`);
    const loginUrl = new URL("/auth/login", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api/upload|_next/static|_next/image|favicon.ico).*)"],
};
