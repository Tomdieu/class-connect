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

// Shared handler for both GET and POST requests
async function handleRedirect(req: NextRequest) {
  const session = await auth();
  let redirectUrl = "/auth/login"; // Default redirect

  if (session?.user) {
    // Cast to UserType to ensure we have the right properties
    const user = session.user as UserType;
    
    // Determine role more explicitly
    let role = "student"; // Default role
    
    if (user.is_superuser || user.is_staff) {
      role = "admin";
    } else if (user.education_level === "PROFESSIONAL") {
      role = "teacher";
    } else {
      // Check for student explicitly based on education level
      if (["COLLEGE", "LYCEE", "UNIVERSITY"].includes(user.education_level)) {
        role = "student";
      }
    }
    
    console.log("User details for redirect:", { 
      id: user.id,
      email: user.email,
      educationLevel: user.education_level,
      isSuperuser: user.is_superuser,
      isStaff: user.is_staff,
      role: role
    });
    
    // Set redirect based on role
    if (role === "student") {
      redirectUrl = "/students";
    } else if (role === "teacher") {
      redirectUrl = "/dashboard";
    } else if (role === "admin") {
      redirectUrl = "/admin";
    }
    
    console.log(`Redirecting ${role} to: ${redirectUrl}`);
  }
  
  // Check if this request is likely from a browser and should perform automatic redirect
  // Look at Accept header to determine if a browser made this request
  const acceptHeader = req.headers.get("accept") || "";
  const wantsBrowserResponse = acceptHeader.includes("text/html");
  
  // Get the API vs direct navigation preference from query param or header
  const preferJson = req.nextUrl.searchParams.get("json") === "true" || 
                     req.headers.get("X-Prefer-Json") === "true";
                     
  if (wantsBrowserResponse && !preferJson) {
    // Browser direct navigation - perform automatic redirect
    return Response.redirect(new URL(redirectUrl, req.url), 307);
  }
  
  // API call or client-side JavaScript - return JSON response
  return Response.json({ redirectUrl }, {
    status: 200,
  });
}