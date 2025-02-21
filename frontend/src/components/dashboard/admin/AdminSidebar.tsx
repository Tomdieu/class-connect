"use client";
import { Users, BookOpen, BarChart3, Settings, CreditCard, Bell } from "lucide-react";
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
} from "@/components/ui/sidebar";
import { usePathname } from "next/navigation";
import { getPathAfterLanguage } from "@/lib/utils";
import Link from "next/link";
import { useI18n } from "@/locales/client";

export const AdminSidebar = () => {
  const pathname = usePathname();
  const { openMobile } = useSidebar();
  const t = useI18n();

  const menuItems = [
    {
      label: t("adminSidebar.management"),
      items: [
        { title: t("adminSidebar.items.users"), icon: Users, url: "/admin/users" },
        { title: t("adminSidebar.items.courses"), icon: BookOpen, url: "/admin/classes" },
        { title: t("adminSidebar.items.payments"), icon: CreditCard, url: "/admin/payments" },
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

  const correctPath = getPathAfterLanguage(pathname);

  return (
    <Sidebar>
      <SidebarContent className="bg-white">
        <div className="font-bold text-xl p-5 pb-0 flex items-center justify-between">
          <Link href="/admin">
            <span>{t("adminSidebar.title")}</span>
          </Link>
          {openMobile && <SidebarTrigger />}
        </div>
        {menuItems.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.title} className={`hover:text-primary/80 hover:bg-primary/5 ${correctPath.startsWith(item.url) ? "text-primary bg-primary/5 font-semibold" : ""}`}>
                    <SidebarMenuButton asChild>
                      <a href={item.url}>
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
    </Sidebar>
  );
};
