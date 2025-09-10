"use client"
import StudentProvider from "./provider";
import { StudentSidebar } from "@/components/student/StudentSidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { UserMenu } from "@/components/dashboard/user/UserMenu";
import ChangeLanguage from "@/components/ChangeLanguage";
import { useSession } from "next-auth/react";
import { BookOpen } from "lucide-react";

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();

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
