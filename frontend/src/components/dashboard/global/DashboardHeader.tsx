"use client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useSidebar } from "@/components/ui/sidebar";
import { BookOpen, Menu, Settings, User, LogOut, Globe } from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";
import { useChangeLocale, useI18n } from "@/locales/client";
import { cn } from "@/lib/utils";

type Checked = boolean;

function DashboardHeader() {
  const { toggleSidebar, isMobile } = useSidebar();
  const { data: session } = useSession();
  const changeLocale = useChangeLocale();
  const t = useI18n();
  const [selectedLanguage, setSelectedLanguage] = React.useState<string>("en");

  const handleLanguageChange = (lang: string) => {
    setSelectedLanguage(lang);
    changeLocale(lang);
  };

  const getProfileUrl = () => {
    if (session?.user.role == "admin") {
      return "/admin/profile";
    } else if (session?.user.role == "teacher") {
      return "/dashboard/profile";
    } else {
      return "/dashboard/profile";
    }
  };

  const getInitials = (name: string) => {
    const [firstName, lastName] = name.split(" ");
    return firstName?.[0] + lastName?.[0];
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div
        className={cn(
          "flex h-16 items-center justify-end px-4",
          isMobile && "justify-between"
        )}
      >
        {isMobile && (
          <Button onClick={toggleSidebar} size="icon" variant="ghost">
            <Menu className="h-5 w-5" />
          </Button>
        )}

        <div className="flex items-center gap-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                <Avatar className="h-9 w-9 border">
                  <AvatarImage
                    src={session?.user?.avatar}
                    alt={session?.user.first_name}
                  />
                  <AvatarFallback>
                    {getInitials(
                      `${session?.user.first_name} ${session?.user.last_name}`
                    )}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium">
                    {session?.user.first_name} {session?.user.last_name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {session?.user.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <Link href={getProfileUrl()} className="cursor-pointer">
                  <DropdownMenuItem>
                    <User className="mr-2 h-4 w-4" />
                    {t("nav.profile")}
                  </DropdownMenuItem>
                </Link>
                {session?.user?.role == "admin" && (
                  <Link href={"/admin/settings"}>
                    <DropdownMenuItem>
                      <Settings className="mr-2 h-4 w-4" />
                      {t("dashboardPage.settings")}
                    </DropdownMenuItem>
                  </Link>
                )}
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  <Globe className="mr-2 h-4 w-4" />
                  <span>{t("nav.language")}</span>
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  <DropdownMenuCheckboxItem
                    checked={selectedLanguage === "en"}
                    onCheckedChange={() => handleLanguageChange("en")}
                  >
                    <span className="mr-2">🇺🇸</span>
                    <span>English</span>
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={selectedLanguage === "fr"}
                    onCheckedChange={() => handleLanguageChange("fr")}
                  >
                    <span className="mr-2">🇫🇷</span>
                    <span>Français</span>
                  </DropdownMenuCheckboxItem>
                </DropdownMenuSubContent>
              </DropdownMenuSub>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => signOut({ redirectTo: "/auth/login" })}
              >
                <LogOut className="mr-2 h-4 w-4" />
                {t("nav.logout")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}

export default DashboardHeader;
