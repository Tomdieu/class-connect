"use client";
import { AdminSidebar } from "@/components/dashboard/admin/AdminSidebar";
import DashboardHeader from "@/components/dashboard/global/DashboardHeader";
import { SidebarProvider } from "@/components/ui/sidebar";
import React,{useEffect} from "react";
import { useSession, signOut } from "next-auth/react";

export default function AdminLayout({ children }: React.PropsWithChildren) {
  const { data: session } = useSession();

  useEffect(() => {
    if (!session?.user?.expiresAt) return;

    const checkExpiration = () => {
      const currentTime = Date.now();
      const expiresAt = session.user.expiresAt as number;

      if (currentTime >= expiresAt) {
        signOut({ redirect: true, callbackUrl: "/" });
      }
    };

    const intervalId = setInterval(checkExpiration, 1000);

    // Initial check
    checkExpiration();

    return () => clearInterval(intervalId);
  }, [session]);

  return (
    <SidebarProvider
      aria-describedby="dashboard-layout"
      className="h-full flex w-full"
    >
      <div className="flex flex-1 w-full">
        <AdminSidebar />
        <main className="flex flex-col flex-1 h-full w-full">
          <DashboardHeader />
          <div className="flex-1 overflow-auto">{children}</div>
        </main>
      </div>
    </SidebarProvider>
  );
}
