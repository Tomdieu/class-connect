"use client";
import { Users, BookOpen, BarChart3, Settings, CreditCard, Rss, Bell, GraduationCap, X, Video } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
  SidebarHeader,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { usePathname } from "next/navigation";
import { getPathAfterLanguage } from "@/lib/utils";
import Link from "next/link";
import { useI18n } from "@/locales/client";

export const AdminSidebar = () => {
  const pathname = usePathname();
  const { openMobile, toggleSidebar } = useSidebar();
  const t = useI18n();

  const menuItems = [
    {
      label: t("adminSidebar.management"),
      items: [
        { title: t("adminSidebar.items.users"), icon: Users, url: "/admin/users" },
        { title: t("adminSidebar.items.courses"), icon: BookOpen, url: "/admin/classes" },
        { title: t("adminSidebar.items.courseOfferings"), icon: GraduationCap, url: "/admin/course-offerings" },
        { title: t("adminSidebar.items.payments"), icon: CreditCard, url: "/admin/payments" },
        { title: t("adminSidebar.items.forum"), icon: Rss, url: "/admin/forum" },
        { title: t("adminSidebar.items.onlineMeetings"), icon: Video, url: "/admin/online-meetings" },
      ],
    },
    {
      label: t("adminSidebar.analytics"),
      items: [
        { title: t("adminSidebar.items.statistics"), icon: BarChart3, url: "/admin/statistics" },
        { title: t("adminSidebar.items.notifications"), icon: Bell, url: "/admin/notifications" },
      ],
    },
    {
      label: t("adminSidebar.configuration"),
      items: [{ title: t("adminSidebar.items.settings"), icon: Settings, url: "/admin/settings" }],
    },
  ];

  const correctPath = getPathAfterLanguage(pathname!);

  return (
    <Sidebar
      collapsible="offcanvas"
      variant="sidebar"
      className="border-none bg-white outline-none shadow-lg min-h-screen bg-card/95 backdrop-blur"
    >
      <SidebarHeader className="flex bg-white w-full py-3 items-start justify-between border-b border-border/50">
        <div className="flex flex-1 w-full items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="bg-primary/10 p-2 rounded-lg">
              <Settings className="h-6 w-6 text-primary" />
            </div>
            <span className="font-bold text-lg bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
              {t("adminSidebar.title")}
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

      <SidebarContent className="bg-white px-2">
        {menuItems.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel className="px-2 text-xs uppercase tracking-wider text-muted-foreground/70">
              {group.label}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => (
                  <SidebarMenuItem
                    key={item.url}
                    className={`rounded-lg mb-1 transition-all duration-200 ${
                      correctPath.startsWith(item.url)
                        ? "bg-primary text-primary-foreground font-medium shadow-md"
                        : "hover:bg-primary/10 text-foreground/70 hover:text-primary"
                    }`}
                  >
                    <SidebarMenuButton
                      asChild
                      isActive={correctPath.startsWith(item.url)}
                      tooltip={item.title}
                      className="p-2"
                    >
                      <Link href={item.url} className="flex items-center gap-3">
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
            <SidebarSeparator className="my-0 opacity-50" />
          </SidebarGroup>
        ))}

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
};
