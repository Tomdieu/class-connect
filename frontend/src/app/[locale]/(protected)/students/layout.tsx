import { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import StudentProvider from "./provider";
import { StudentSidebar } from "@/components/student/StudentSidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { UserMenu } from "@/components/dashboard/user/UserMenu";
import ChangeLanguage from "@/components/ChangeLanguage";

export const metadata: Metadata = {
  title: "Student Dashboard",
  description: "Access your classes, subjects, and learning materials",
};

export default async function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session || !session.user) {
    redirect("/auth/login");
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
          <main className="flex-1 h-full flex w-full flex-col relative">
            <div className="flex shadow-lg sticky top-0 border-b border-white/20 backdrop-blur-md bg-white/10 items-center py-3 justify-between px-4">
              <SidebarTrigger className="" />
              <div className="flex items-center gap-4">
                <UserMenu />
                <div className="border-l pl-4 border-gray-200">
              <ChangeLanguage />
            </div>
              </div>
            </div>

            <div className="flex-1 p-6">{children}</div>
            <div className="mt-auto w-full pt-4 border-t border-border">
              <div className="px-4 py-3">
                <p className="text-xs text-center text-muted-foreground">
                  Copyright © 2024 ClassConnect
                </p>
              </div>
            </div>
          </main>
        </div>
      </SidebarProvider>
    </StudentProvider>
  );
}
