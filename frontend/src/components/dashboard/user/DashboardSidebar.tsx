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

// Menu items.
const items = [
  {
    title: "Home",
    url: "/dashboard",
    icon: TiHome,
  },
  {
    title: "Mes eleves",
    url: "#",
    icon: FaGraduationCap,
  },
  {
    title: "Mes disponibilités",
    url: "#",
    icon: FaCalendarCheck,
  },
  {
    title: "Mes paiements",
    url: "#",
    icon: FaEuroSign,
  },
  {
    title: "Mes ressources",
    url: "#",
    icon: IoLibrarySharp,
  },
  {
    title: "Nous contacter",
    url: "#",
    icon: IoChatbubbles,
  },
]

export default function DashboardSidebar() {
  const { toggleSidebar } = useSidebar()
  const pathname = usePathname()
  const correctPath = getPathAfterLanguage(pathname)
  return (
    <Sidebar collapsible="offcanvas" aria-describedby="dashboard-sidebar" className="bg-white border-none outline-none shadow-lg">
      <SidebarContent aria-labelledby="x" aria-describedby="dashboard-sidebar" className="bg-white border-none outline-none">
        <SidebarGroup>
          <div className="flex items-center justify-between mb-4">

            <SidebarGroupLabel className="font-bold text-xl">Menu</SidebarGroupLabel>

            <div onClick={toggleSidebar} className="cursor-pointer">
              <X className="text-muted-foreground size-6"/>
            </div>
          </div>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title} className={`rounded-md hover:bg-default/15 ${correctPath === item.url ? "bg-indigo-500" : ""}`}>
                  <SidebarMenuButton asChild>
                    <a href={item.url} className="w-full flex items-center gap-2 p-2 text-sm outline-none ring-sidebar-ring transition-[width,height,padding] hover:bg-default/15">
                      <item.icon className="w-8 h-8"/>
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
