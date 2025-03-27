"use client";
import { BookOpen, X } from "lucide-react";
import { TiHome } from "react-icons/ti";
import { FaCalendarCheck, FaTasks } from "react-icons/fa";
import { FaEuroSign } from "react-icons/fa";
import { IoLibrarySharp } from "react-icons/io5";
import { IoChatbubbles } from "react-icons/io5";
import { FaGraduationCap } from "react-icons/fa6";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { usePathname } from "next/navigation";
import { getPathAfterLanguage } from "@/lib/utils";
import { useI18n } from "@/locales/client";
import Link from "next/link";

export default function DashboardSidebar() {
  const { toggleSidebar } = useSidebar();
  const pathname = usePathname();
  const correctPath = getPathAfterLanguage(pathname);
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
      title: t("dashboardSidebar.myCourseOfferings"),
      url: "/dashboard/course-offering",
      icon: FaTasks
    },
    {
      title: t("dashboardSidebar.myAvailabilities"),
      url: "/dashboard/my-availabilities",
      icon: FaCalendarCheck,
    },
    {
      title: t("dashboardSidebar.myPayments"),
      url: "/dashboard/salaire",
      icon: FaEuroSign,
    },
    {
      title: t("dashboardSidebar.myResources"),
      url: "#",
      icon: IoLibrarySharp,
    },
    {
      title: t("dashboardSidebar.contactUs"),
      url: "/dashboard/message",
      icon: IoChatbubbles,
    },
  ];

  return (
    <Sidebar
      collapsible="offcanvas"
      variant="sidebar"
      className="border-none outline-none shadow-lg min-h-screen"
    >
      <SidebarContent className="bg-white flex flex-col h-full">
        <SidebarGroup>
          <div className="flex items-center justify-between mb-8">
            {/* <SidebarGroupLabel className="text-xl font-semibold text-gray-800">
              {t("dashboardSidebar.menu")}
            </SidebarGroupLabel> */}
            <Link
              href="/dashboard"
              className="flex items-center gap-2 px-1 text-blue-600 transition-colors hover:text-blue-700"
            >
              <BookOpen className="h-8 w-8" />
              <span className="font-bold text-2xl inline-block">
                ClassConnect
              </span>
            </Link>
            <div
              onClick={toggleSidebar}
              className="cursor-pointer md:hidden hover:bg-gray-100 p-2 rounded-full transition-colors"
            >
              <X className="text-gray-500 size-5" />
            </div>
          </div>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-2">
              {items.map((item) => (
                <SidebarMenuItem
                  key={item.title}
                  className={`
                    rounded-xl transition-all duration-200 
                    ${
                      correctPath === item.url
                        ? "bg-primary rounded-sm text-white shadow-md shadow-default/25 hover:bg-primary/90"
                        : "hover:bg-gray-100/80 text-gray-600 hover:text-gray-900"
                    }
                  `}
                >
                  <SidebarMenuButton asChild>
                    <a
                      href={item.url}
                      className="flex items-center gap-3 px-4 py-3"
                    >
                      <item.icon
                        className={`size-5 ${
                          correctPath === item.url
                            ? "text-white"
                            : "text-gray-500"
                        }`}
                      />
                      <span className="font-medium">{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Footer - You can add this optionally */}
        <div className="mt-auto pt-4 border-t border-gray-100">
          <div className="px-4 py-3">
            <p className="text-xs text-gray-500">© 2024 ClassConnect</p>
          </div>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}
