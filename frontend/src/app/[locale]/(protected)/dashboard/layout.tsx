"use client"
import DashboardHeader from '@/components/dashboard/global/DashboardHeader'
import DashboardSidebar from '@/components/dashboard/user/DashboardSidebar'
import { SidebarProvider } from '@/components/ui/sidebar'
import { getUserRole } from '@/lib/utils'
import { UserType } from '@/types'
import { Loader2 } from 'lucide-react'
import { signOut, useSession } from 'next-auth/react'
import React, { useEffect, useState } from 'react'

export default function DashboardLayout({ children }: React.PropsWithChildren) {
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
      if (role !== "teacher") {
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
    <SidebarProvider aria-describedby="dashboard-layout">

      <div className='w-full h-full flex'>
        <DashboardSidebar />
        <main className='flex flex-col h-full w-full relative'>
          <DashboardHeader />
          {children}
        </main>

      </div>
    </SidebarProvider>
  )
}
