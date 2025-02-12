import { auth } from "@/auth"
import { createI18nMiddleware } from "next-international/middleware";
import { NextResponse } from "next/server";

const I18nMiddleware = createI18nMiddleware({
  locales: ["en", "fr"],
  defaultLocale: "fr",
});

// List of routes that require authentication (without locale prefix)
const protectedRoutes = ["/dashboard", "/admin"]

export default auth((req) => {
  const isLoggedIn = !!req.auth
  const pathname = req.nextUrl.pathname

  // Check if the current path matches any protected route, accounting for locale prefixes
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(`/en${route}`) || pathname.startsWith(`/fr${route}`)
  )

  if (isProtectedRoute && !isLoggedIn) {
    // Redirect to the home page while preserving the current locale
    const locale = pathname.startsWith('/en') ? '/en' : '/fr'
    return NextResponse.redirect(new URL(locale, req.url))
  }

  return I18nMiddleware(req)
})

// export const config = {
//   matcher:'/'
// }

export const config = {
  matcher: [
    "/((?!api|static|.*\\..*|_next|favicon.ico|robots.txt).*)",
  ],
};