import { auth } from "@/auth";
import { createI18nMiddleware } from "next-international/middleware";
import { NextResponse } from "next/server";

const I18nMiddleware = createI18nMiddleware({
  locales: ["en", "fr"],
  defaultLocale: "fr",
});

// List of routes that require authentication (without locale prefix)
const protectedRoutes = ["/dashboard", "/admin","/students","/subscribe"];

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const pathname = req.nextUrl.pathname;

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