"use client";
import {
  Users,
  BookOpen,
  BarChart3,
  Settings,
  CreditCard,
  Bell,
} from "lucide-react";
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

const menuItems = [
  {
    label: "Gestion",
    items: [
      { title: "Utilisateurs", icon: Users, url: "/admin/users" },
      { title: "Cours", icon: BookOpen, url: "/admin/classes" },
      { title: "Paiements", icon: CreditCard, url: "/admin/payments" },
    ],
  },
  {
    label: "Analyse",
    items: [
      { title: "Statistiques", icon: BarChart3, url: "/admin/statistics" },
      { title: "Notifications", icon: Bell, url: "/admin/notifications" },
    ],
  },
  {
    label: "Configuration",
    items: [{ title: "Paramètres", icon: Settings, url: "/admin/settings" }],
  },
];

export const AdminSidebar = () => {
  const pathname = usePathname();
  const { toggleSidebar, isMobile, openMobile } = useSidebar();

  const correctPath = getPathAfterLanguage(pathname);
  return (
    <Sidebar>
      <SidebarContent className="bg-white">
        <div className="font-bold text-xl p-5 pb-0 flex items-center justify-between">
          <Link href="/admin">
          <span>Administrator</span>
          </Link>
          {openMobile && (

            <SidebarTrigger />
          )}
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
