"use client";
import { AdminSidebar } from "@/components/dashboard/admin/AdminSidebar";
import DashboardHeader from "@/components/dashboard/global/DashboardHeader";
import { SidebarProvider } from "@/components/ui/sidebar";
import React, {  } from "react";
import { useSession } from "next-auth/react";
import { BookOpen } from "lucide-react";

export default function AdminLayout({ children }: React.PropsWithChildren) {
  const {status } = useSession();

 // Show loading state only while session is loading
  if (status === "loading") {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="animate-pulse">
        <BookOpen className="h-16 w-16 text-primary animate-bounce" strokeWidth={1.5} />
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
