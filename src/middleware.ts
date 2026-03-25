import NextAuth from "next-auth";
import { authConfig } from "./auth.config";
import { NextResponse } from "next/server";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isLoggedIn = !!req.auth;

  // 1. Autoriser les routes publiques, auth et assets
  const publicRoutes = ["/auth/login", "/auth/error", "/register", "/auth/setup-password"];
  const isPublicRoute = publicRoutes.some((route) => pathname === route || pathname.startsWith(route + "/"));
  const isAuthRoute = pathname.startsWith("/api/auth");
  const isAsset = pathname.startsWith("/_next") || pathname.startsWith("/favicon.ico") || pathname.includes(".");

  if (isPublicRoute || isAuthRoute || isAsset) {
    return NextResponse.next();
  }

  // 2. Protection si non-connecté
  if (!isLoggedIn) {
    const loginUrl = new URL("/auth/login", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 3. Protections spécifiques Rôles (Admin/Dashboard)
  const user = req.auth?.user;
  const role = (user?.role as string || "STUDENT").toUpperCase();
  const isAdmin = role === "ADMIN";
  const isTrainer = role === "TRAINER";

  // Protection /admin
  if (pathname.startsWith("/admin")) {
    const trainerAllowedPaths = ["/admin/groups", "/admin/modules", "/admin/stagiaires", "/admin/upload", "/admin/profile", "/admin/settings", "/admin/dashboard"];
    const isAllowedForTrainer = trainerAllowedPaths.some(p => pathname.startsWith(p));

    if (!isAdmin && !(isTrainer && isAllowedForTrainer)) {
      return NextResponse.redirect(new URL(role === "STUDENT" ? "/catalogue" : "/admin/dashboard", req.url));
    }
  }

  // Protection /dashboard
  if (pathname.startsWith("/dashboard") && !isAdmin && !isTrainer) {
    return NextResponse.redirect(new URL("/catalogue", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api/upload|_next/static|_next/image|favicon.ico).*)"],
};
