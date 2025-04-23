"use client";

import {
  GraduationCap,
  Home,
  Receipt,
  User,
  BookOpen,
  X,
  Video,
  Users,
  Rss,
} from "lucide-react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useI18n } from "@/locales/client";
import { getPathAfterLanguage } from "@/lib/utils";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarSeparator,
  useSidebar,
} from "@/components/ui/sidebar";

export function StudentSidebar() {
  const t = useI18n();
  const pathname = usePathname();
  const { toggleSidebar } = useSidebar();

  // Use getPathAfterLanguage like AdminSidebar does
  const correctPath = getPathAfterLanguage(pathname!);

  const menuItems = [
    {
      title: t("common.dashboard"),
      icon: Home,
      href: "/students",
    },
    {
      title: t("student.dashboard.myClasses"),
      icon: GraduationCap,
      href: "/students/classes",
    },
    {
      title: t("student.dashboard.myCourses"),
      icon: BookOpen,
      href: "/students/mes-cours"
    },
    {
      title: t("student.dashboard.myVideos"),
      icon: Video,
      href: "/students/mes-video"
    },
    {
      title: t("student.dashboard.myTeachers"),
      icon: Users,
      href: "/students/mes-profs"
    },
    {
      title: t("student.dashboard.chat"),
      icon: Rss,
      href: "/students/forum"
    },
    {
      title: t("nav.subscriptions"),
      icon: Receipt,
      href: "/students/subscriptions",
    },
  ];

  const accountItems = [
    {
      title: t("nav.profile"),
      icon: User,
      href: "/students/profile",
    },
  ];

  return (
    <Sidebar
      collapsible="offcanvas"
      variant="sidebar"
      className="border-none bg-white outline-none shadow-lg min-h-screen bg-card/95 backdrop-blur"
    >
      <SidebarHeader className="bg-white flex w-full py-3 items-start justify-between border-b border-border/50">
        <div className="flex flex-1 w-full items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="bg-primary/10 p-2 rounded-lg">
              <BookOpen className="h-6 w-6 text-primary" />
            </div>
            <span className="font-bold text-lg bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
              ClassConnect
            </span>
          </div>
          <div
            onClick={toggleSidebar}
            className="cursor-pointer md:hidden hover:bg-primary/10 p-2 rounded-full transition-colors"
          >
            <X className="text-gray-500 size-5" />
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="bg-transparent px-2 bg-white z-[9999999999999]">
        <SidebarGroup>
          <SidebarGroupLabel className="px-2 text-xs uppercase tracking-wider text-muted-foreground/70">
            {t("common.dashboard")}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem 
                  key={item.href} 
                  className={`rounded-lg mb-1 transition-all duration-200 ${
                    (correctPath === item.href || 
                     (item.href !== "/students" && correctPath.startsWith(item.href))) 
                      ? "bg-primary text-primary-foreground font-medium shadow-md" 
                      : "hover:bg-primary/10 text-foreground/70 hover:text-primary"
                  }`}
                >
                  <SidebarMenuButton
                    asChild
                    isActive={correctPath === item.href || 
                              (item.href !== "/students" && correctPath.startsWith(item.href))}
                    tooltip={item.title}
                    className="p-2"
                  >
                    <Link href={item.href} className="flex items-center gap-3">
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator className="my-4 opacity-50" />

        <SidebarGroup>
          <SidebarGroupLabel className="px-2 text-xs uppercase tracking-wider text-muted-foreground/70">
            {t("profile.personalInfo")}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {accountItems.map((item) => (
                <SidebarMenuItem 
                  key={item.href}
                  className={`rounded-lg mb-1 transition-all duration-200 ${
                    correctPath.startsWith(item.href) 
                      ? "bg-primary text-primary-foreground font-medium shadow-md" 
                      : "hover:bg-primary/10 text-foreground/70 hover:text-primary"
                  }`}
                >
                  <SidebarMenuButton
                    asChild
                    isActive={correctPath.startsWith(item.href)}
                    tooltip={item.title}
                    className="p-2"
                  >
                    <Link href={item.href} className="flex items-center gap-3">
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <div className="mt-auto w-full pt-4 border-t border-border/50">
          <div className="px-4 py-3">
            <p className="text-xs text-center text-muted-foreground/70">
              Copyright © 2024 ClassConnect
            </p>
          </div>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}
