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
} from "@/components/ui/sidebar";

const menuItems = [
  {
    label: "Gestion",
    items: [
      { title: "Utilisateurs", icon: Users, url: "/admin/users" },
      { title: "Cours", icon: BookOpen, url: "/admin/courses" },
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
    items: [
      { title: "Paramètres", icon: Settings, url: "/admin/settings" },
    ],
  },
];

export const AdminSidebar = () => {
  return (
    <Sidebar>
      <SidebarContent>
        <div className="font-bold text-xl p-5 pb-0">Administrator</div>
        {menuItems.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.title}>
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