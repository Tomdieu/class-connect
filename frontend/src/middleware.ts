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

  // First, let the i18n middleware handle locale detection and redirection
  // Skip i18n processing only for our redirect route
  if (!pathname.includes('/redirect')) {
    const response = I18nMiddleware(req);
    // If i18n middleware wants to redirect, let it
    if (response && response.status >= 300 && response.status < 400) {
      return response;
    }
  }

  // Extract locale from pathname
  const getLocaleFromPath = (path: string) => {
    if (path.startsWith('/en/') || path === '/en') return 'en';
    if (path.startsWith('/fr/') || path === '/fr') return 'fr';
    return 'fr'; // default
  };

  const locale = getLocaleFromPath(pathname);
  const localePrefix = `/${locale}`;

  // Handle redirect route
  if (pathname === `/${locale}/redirect` || pathname.endsWith('/redirect')) {
    if (isLoggedIn && req.auth?.user) {
      const user = req.auth.user as UserType;
      const role = getUserRole(user);
      
      console.log('Redirecting user with role:', role, 'User data:', user);
      
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
        default:
          redirectPath = "/dashboard"; // fallback
      }
      
      const redirectUrl = new URL(`${localePrefix}${redirectPath}`, req.nextUrl.origin);
      console.log('Redirecting to:', redirectUrl.toString());
      return NextResponse.redirect(redirectUrl);
    } else {
      // Not logged in, redirect to login
      const loginUrl = new URL(`${localePrefix}/auth/login`, req.nextUrl.origin);
      console.log('User not logged in, redirecting to:', loginUrl.toString());
      return NextResponse.redirect(loginUrl);
    }
  }

  // Remove locale prefix from pathname for route matching
  const pathWithoutLocale = pathname.replace(`/${locale}`, '') || '/';

  // Check if the current path matches any protected route
  const isProtectedRoute = protectedRoutes.some((route) => {
    return pathWithoutLocale === route || pathWithoutLocale.startsWith(`${route}/`);
  });

  // Handle protected routes
  if (isProtectedRoute && !isLoggedIn) {
    console.log('Protected route accessed without auth:', pathname);
    
    // Create the redirect URL pointing to the login page
    const url = new URL(`${localePrefix}/auth/login`, req.nextUrl.origin);
    // Add the full path (with locale) as callbackUrl
    url.searchParams.set("callbackUrl", encodeURIComponent(pathname));
    
    return NextResponse.redirect(url);
  }

  // Role-based access control for authenticated users
  if (isLoggedIn && req.auth?.user && isProtectedRoute) {
    const user = req.auth.user as UserType;
    const role = getUserRole(user);
    
    // Define which roles can access which routes
    const roleRouteMap = {
      admin: ["/admin", "/dashboard", "/students", "/subscribe"],
      teacher: ["/dashboard", "/subscribe"],
      student: ["/students", "/subscribe"]
    };
    
    const allowedRoutes = roleRouteMap[role as keyof typeof roleRouteMap] || [];
    const hasAccess = allowedRoutes.some(route => 
      pathWithoutLocale === route || pathWithoutLocale.startsWith(`${route}/`)
    );
    
    if (!hasAccess) {
      console.log('Access denied for role:', role, 'to path:', pathWithoutLocale);
      
      // Redirect to appropriate dashboard based on role
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
      
      const redirectUrl = new URL(`${localePrefix}${redirectPath}`, req.nextUrl.origin);
      return NextResponse.redirect(redirectUrl);
    }
  }

  // If we reach here, let the request proceed normally
  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!api|static|.*\\..*|_next|favicon.ico|robots.txt|manifest.webmanifest).*)",
  ],
};


// import { auth } from "@/auth";
// import { createI18nMiddleware } from "next-international/middleware";
// import { NextResponse } from "next/server";
// import { getUserRole } from "@/lib/utils";
// import { UserType } from "@/types";

// const I18nMiddleware = createI18nMiddleware({
//   locales: ["en", "fr"],
//   defaultLocale: "fr",
// });

// // List of routes that require authentication (without locale prefix)
// const protectedRoutes = ["/dashboard", "/admin", "/students", "/subscribe"];

// export default auth((req) => {
//   const isLoggedIn = !!req.auth;
//   const pathname = req.nextUrl.pathname;

//   // Check if this is a redirect route and handle it immediately
//   if (pathname.includes('/redirect')) {
//     if (isLoggedIn && req.auth?.user) {
//       const user = req.auth.user as UserType;
//       const role = getUserRole(user);
      
//       // Get the current locale
//       const locale = pathname.startsWith('/en') ? '/en' : '/fr';
      
//       let redirectPath = "/auth/login";
//       switch (role) {
//         case "student":
//           redirectPath = "/students";
//           break;
//         case "teacher":
//           redirectPath = "/dashboard";
//           break;
//         case "admin":
//           redirectPath = "/admin";
//           break;
//       }
      
//       const redirectUrl = new URL(`${locale}${redirectPath}`, req.nextUrl.origin);
//       return NextResponse.redirect(redirectUrl, 301);
//     } else {
//       // Not logged in, redirect to login
//       const locale = pathname.startsWith('/en') ? '/en' : '/fr';
//       const loginUrl = new URL(`${locale}/auth/login`, req.nextUrl.origin);
//       return NextResponse.redirect(loginUrl, 301);
//     }
//   }

//   // Check if the current path matches any protected route, accounting for locale prefixes
//   const isProtectedRoute = protectedRoutes.some((route) =>
//     pathname.startsWith(`/en${route}`) || pathname.startsWith(`/fr${route}`)
//   );

//   if (isProtectedRoute && !isLoggedIn) {
//     // Get the current locale
//     const locale = pathname.startsWith('/en') ? '/en' : '/fr';
    
//     // Create the redirect URL pointing to the login page
//     const url = new URL(`${locale}/auth/login`, req.nextUrl.origin);
//     // Remove the locale prefix from pathname for the callback
//     const callbackPath = pathname.replace(/^\/(?:en|fr)/, '');
//     // Add the full path (with locale) as callbackUrl
//     url.searchParams.set("callbackUrl", `${locale}${callbackPath}`);
    
//     return NextResponse.redirect(url);
//   }

//   return I18nMiddleware(req);
// });

// export const config = {
//   matcher: [
//     "/((?!api|static|.*\\..*|_next|favicon.ico|robots.txt|manifest.webmanifest).*)",
//   ],
// };