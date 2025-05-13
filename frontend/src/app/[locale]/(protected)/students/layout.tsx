"use client"
import { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import StudentProvider from "./provider";
import { StudentSidebar } from "@/components/student/StudentSidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { UserMenu } from "@/components/dashboard/user/UserMenu";
import ChangeLanguage from "@/components/ChangeLanguage";
import { signOut, useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { getUserRole } from "@/lib/utils";
import { UserType } from "@/types";
import { Loader2 } from "lucide-react";

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();

  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  // Check authorization immediately when session is available
  useEffect(() => {
    const checkAuthorization = async () => {
      // If not authenticated at all, redirect to login
      if (status === "unauthenticated") {
        window.location.href = "/redirect"; // Use API for automatic redirection
        return;
      }

      // If still loading session, wait
      if (status === "loading" || !session?.user) return;

      // Check for session expiration
      if (session.user.expiresAt) {
        const currentTime = Date.now();
        const expiresAt = session.user.expiresAt as number;
        if (currentTime >= expiresAt) {
          signOut({ redirect: true, callbackUrl: "/auth/login" });
          return;
        }
      }

      // Check if user has admin role
      const role = getUserRole(session.user as UserType);
      if (role !== "student") {
        // Immediately redirect non-admin users to their appropriate page
        // Use the direct API endpoint for automatic server-side redirection
        window.location.href = "/redirect"; // This will automatically redirect to the right page
        return;
      }

      // User is authorized - show admin UI
      setIsAuthorized(true);

      // Set up expiration check interval
      const intervalId = setInterval(() => {
        if (session?.user?.expiresAt) {
          const currentTime = Date.now();
          const expiresAt = session.user.expiresAt as number;
          if (currentTime >= expiresAt) {
            signOut({ redirect: true, callbackUrl: "/auth/login" });
          }
        }
      }, 1000);

      return () => clearInterval(intervalId);
    };

    checkAuthorization();
  }, [session, status]);

  // Show loading state while checking authorization
  if (isAuthorized === null) {
    return (
      <div className="flex items-center justify-center h-screen w-full">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-default" />
          <p className="text-sm text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <StudentProvider>
      <SidebarProvider
        defaultOpen={true}
        aria-describedby="dashboard-layout"
        className="h-full flex w-full"
      >
        <div className="relative flex min-h-screen w-full">
          <StudentSidebar />
          <main className="flex-1 h-full flex w-full flex-col relative overflow-x-hidden">
            <div className="flex shadow-lg z-10 sticky top-0 border-b border-white/20 backdrop-blur-md bg-white/10 items-center py-3 justify-between px-4">
              <SidebarTrigger className="" />
              <div className="flex items-center gap-4">
                <UserMenu />
                <div className="border-l pl-4 border-gray-200">
                  <ChangeLanguage />
                </div>
              </div>
            </div>

            <div className="flex-1">{children}</div>

          </main>
        </div>
      </SidebarProvider>
    </StudentProvider>
  );
}
