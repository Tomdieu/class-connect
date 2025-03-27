"use client";
import { AdminSidebar } from "@/components/dashboard/admin/AdminSidebar";
import DashboardHeader from "@/components/dashboard/global/DashboardHeader";
import { SidebarProvider } from "@/components/ui/sidebar";
import React, { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { getUserRole } from "@/lib/utils";
import { UserType } from "@/types";
import { Loader2 } from "lucide-react";

export default function AdminLayout({ children }: React.PropsWithChildren) {
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
      if (role !== "admin") {
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

  // Only render the admin layout if authorized
  return (
    <SidebarProvider
      aria-describedby="dashboard-layout"
      className="h-full flex w-full"
    >
      <div className="flex flex-1 w-full">
        <div className="z-30">
          <AdminSidebar />
        </div>
        <main className="flex flex-col flex-1 h-full w-full z-10 relative">
          <DashboardHeader />
          <div className="flex-1 overflow-y-auto overflow-x-hidden">{children}</div>
        </main>
      </div>
    </SidebarProvider>
  );
}
