"use client"
import { X } from "lucide-react"
import { TiHome } from "react-icons/ti";
import { FaCalendarCheck } from "react-icons/fa";
import { FaEuroSign } from "react-icons/fa";
import { IoLibrarySharp } from "react-icons/io5";
import { IoChatbubbles } from "react-icons/io5";
import { FaGraduationCap } from "react-icons/fa6";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { usePathname } from "next/navigation";
import { getPathAfterLanguage } from "@/lib/utils";
import { useI18n } from "@/locales/client";

export default function DashboardSidebar() {
  const { toggleSidebar } = useSidebar()
  const pathname = usePathname()
  const correctPath = getPathAfterLanguage(pathname)
  const t = useI18n();

  const items = [
    {
      title: t("dashboardSidebar.home"),
      url: "/dashboard",
      icon: TiHome,
    },
    {
      title: t("dashboardSidebar.myStudents"),
      url: "/dashboard/my-students",
      icon: FaGraduationCap,
    },
    {
      title: t("dashboardSidebar.myAvailabilities"),
      url: "/dashboard/my-availabilities",
      icon: FaCalendarCheck,
    },
    {
      title: t("dashboardSidebar.myPayments"),
      url: "#",
      icon: FaEuroSign,
    },
    {
      title: t("dashboardSidebar.myResources"),
      url: "#",
      icon: IoLibrarySharp,
    },
    {
      title: t("dashboardSidebar.contactUs"),
      url: "#",
      icon: IoChatbubbles,
    },
  ];

  return (
    <Sidebar collapsible="offcanvas" aria-describedby="dashboard-sidebar" className="bg-white border-none outline-none shadow-lg">
      <SidebarContent aria-labelledby="x" aria-describedby="dashboard-sidebar" className="bg-white border-none outline-none">
        <SidebarGroup>
          <div className="flex items-center justify-between mb-4">
            <SidebarGroupLabel className="font-bold text-xl">{t("dashboardSidebar.menu")}</SidebarGroupLabel>
            <div onClick={toggleSidebar} className="cursor-pointer sm:hidden">
              <X className="text-muted-foreground size-6"/>
            </div>
          </div>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title} className={`rounded-md hover:bg-default/15 ${correctPath === item.url ? "bg-indigo-500 text-white" : ""}`}>
                  <SidebarMenuButton asChild>
                  {/* className="w-full flex items-center gap-2 p-2 text-sm outline-none ring-sidebar-ring transition-[width,height,padding] hover:bg-default/15" */}
                    <a href={item.url} >
                      <item.icon className="size-8"/>
                      <span className="text-base">{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
