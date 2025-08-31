import { auth } from "@/auth";
import { createI18nMiddleware } from "next-international/middleware";
import { NextResponse } from "next/server";
import { getUserRole } from "@/lib/utils";
import { UserType } from "@/types";

const I18nMiddleware = createI18nMiddleware({
  locales: ["en", "fr"],
  defaultLocale: "fr",
});

// List of routes that require authentication (without locale prefix)
const protectedRoutes = ["/dashboard", "/admin", "/students", "/subscribe"];

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const pathname = req.nextUrl.pathname;

  // Check if this is a redirect route and handle it immediately
  if (pathname.includes('/redirect')) {
    if (isLoggedIn && req.auth?.user) {
      const user = req.auth.user as UserType;
      const role = getUserRole(user);
      
      // Get the current locale
      const locale = pathname.startsWith('/en') ? '/en' : '/fr';
      
      let redirectPath = "/auth/login";
      switch (role) {
        case "student":
          redirectPath = "/students";
          break;
        case "teacher":
          redirectPath = "/dashboard";
          break;
        case "admin":
          redirectPath = "/admin";
          break;
      }
      
      const redirectUrl = new URL(`${locale}${redirectPath}`, req.nextUrl.origin);
      return NextResponse.redirect(redirectUrl, 301);
    } else {
      // Not logged in, redirect to login
      const locale = pathname.startsWith('/en') ? '/en' : '/fr';
      const loginUrl = new URL(`${locale}/auth/login`, req.nextUrl.origin);
      return NextResponse.redirect(loginUrl, 301);
    }
  }

  // Check if the current path matches any protected route, accounting for locale prefixes
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(`/en${route}`) || pathname.startsWith(`/fr${route}`)
  );

  if (isProtectedRoute && !isLoggedIn) {
    // Get the current locale
    const locale = pathname.startsWith('/en') ? '/en' : '/fr';
    
    // Create the redirect URL pointing to the login page
    const url = new URL(`${locale}/auth/login`, req.nextUrl.origin);
    // Remove the locale prefix from pathname for the callback
    const callbackPath = pathname.replace(/^\/(?:en|fr)/, '');
    // Add the full path (with locale) as callbackUrl
    url.searchParams.set("callbackUrl", `${locale}${callbackPath}`);
    
    return NextResponse.redirect(url);
  }

  return I18nMiddleware(req);
});

export const config = {
  matcher: [
    "/((?!api|static|.*\\..*|_next|favicon.ico|robots.txt|manifest.webmanifest).*)",
  ],
};