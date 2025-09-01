import { auth } from "@/auth";
import { getUserRole } from "@/lib/utils";
import { UserType } from "@/types";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  return handleRedirect(req);
}

export async function GET(req: NextRequest) {
  return handleRedirect(req);
}

// Optimized handler for fast redirects
async function handleRedirect(req: NextRequest) {
  const session = await auth();
  let redirectUrl = "/auth/login"; // Default redirect

  if (session?.user) {
    const user = session.user as UserType;
    
    // Fast role determination
    const role = getUserRole(user);
    
    // Set redirect based on role
    switch (role) {
      case "student":
        redirectUrl = "/students";
        break;
      case "teacher":
        redirectUrl = "/dashboard";
        break;
      case "admin":
        redirectUrl = "/admin";
        break;
      default:
        redirectUrl = "/auth/login";
    }
  }
  
  // Check if this request is from a browser
  const acceptHeader = req.headers.get("accept") || "";
  const wantsBrowserResponse = acceptHeader.includes("text/html");
  const preferJson = req.nextUrl.searchParams.get("json") === "true" || 
                     req.headers.get("X-Prefer-Json") === "true";
                     
  if (wantsBrowserResponse && !preferJson) {
    // Browser direct navigation - perform 301 redirect for caching
    return Response.redirect(new URL(redirectUrl, req.url), 301);
  }
  
  // API call - return JSON response with cache headers
  return Response.json({ redirectUrl }, {
    status: 200,
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    }
  });
}