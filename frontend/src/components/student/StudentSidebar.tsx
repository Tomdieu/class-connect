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
  const correctPath = getPathAfterLanguage(pathname);

  // No longer need the custom isPathActive function since we'll use correctPath.startsWith

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

    // {
    //   title: t('student.dashboard.recentActivity'),
    //   icon: Clock, 
    //   href: '/students/activities',
    // },
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
    // {
    //   title: t('dashboardPage.settings'),
    //   icon: Settings,
    //   href: '/students/settings',
    // },
  ];

  return (
    <Sidebar
      collapsible="offcanvas"
      variant="sidebar"
      className="border-none outline-none shadow-lg min-h-screen"
    >
      <SidebarHeader className="flex w-full py-3 bg-white items-start justify-between border-b">
        <div className="flex flex-1 w-full items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="h-8 w-8 text-primary" />
            <span className="font-semibold text-lg text-primary">ClassConnect</span>
          </div>
          <div
            onClick={toggleSidebar}
            className="cursor-pointer md:hidden hover:bg-gray-100 p-2 rounded-full transition-colors"
          >
            <X className="text-gray-500 size-5" />
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="bg-white">
        <SidebarGroup>
          <SidebarGroupLabel>{t("common.dashboard")}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem 
                  key={item.href} 
                  className={`hover:text-primary/80 hover:bg-primary/5 ${
                    (correctPath === item.href || 
                     (item.href !== "/students" && correctPath.startsWith(item.href))) 
                      ? "text-primary bg-primary/5 font-semibold" 
                      : ""
                  }`}
                >
                  <SidebarMenuButton
                    asChild
                    isActive={correctPath === item.href || 
                              (item.href !== "/students" && correctPath.startsWith(item.href))}
                    tooltip={item.title}
                  >
                    <Link href={item.href}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        <SidebarGroup>
          <SidebarGroupLabel>{t("profile.personalInfo")}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {accountItems.map((item) => (
                <SidebarMenuItem 
                  key={item.href}
                  className={`hover:text-primary/80 hover:bg-primary/5 ${
                    correctPath.startsWith(item.href) ? "text-primary bg-primary/5 font-semibold" : ""
                  }`}
                >
                  <SidebarMenuButton
                    asChild
                    isActive={correctPath.startsWith(item.href)}
                    tooltip={item.title}
                  >
                    <Link href={item.href}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
