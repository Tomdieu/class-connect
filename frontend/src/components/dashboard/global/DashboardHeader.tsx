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
} from "@/components/ui/dropdown-menu";
import { useChangeLocale, useI18n } from "@/locales/client";

function DashboardHeader() {
  const { toggleSidebar, isMobile } = useSidebar();
  const { data: session } = useSession();
  const changeLocale = useChangeLocale();
  const t = useI18n();

  const getInitials = (name: string) => {
    const [firstName, lastName] = name.split(" ");
    return firstName?.[0] + lastName?.[0];
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="flex h-16 items-center justify-between px-4">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 text-blue-600 transition-colors hover:text-blue-700"
        >
          <BookOpen className="h-6 w-6" />
          <span className="font-bold text-lg hidden sm:inline-block">ClassConnect</span>
        </Link>

        <div className="flex items-center gap-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                <Avatar className="h-9 w-9">
                  <AvatarImage src="https://github.com/shadcn.png" alt={session?.user.first_name} />
                  <AvatarFallback>
                    {getInitials(`${session?.user.first_name} ${session?.user.last_name}`)}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium">{session?.user.first_name} {session?.user.last_name}</p>
                  <p className="text-xs text-muted-foreground">{session?.user.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  {t("nav.profile")}
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  {t("dashboardPage.settings")}
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  <Globe className="mr-2 h-4 w-4" />
                  <span>{t("nav.language")}</span>
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  <DropdownMenuItem onClick={() => changeLocale("en")}>
                    <span className="mr-2">🇺🇸</span>
                    <span>English</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => changeLocale("fr")}>
                    <span className="mr-2">🇫🇷</span>
                    <span>Français</span>
                  </DropdownMenuItem>
                </DropdownMenuSubContent>
              </DropdownMenuSub>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => signOut()}>
                <LogOut className="mr-2 h-4 w-4" />
                {t("nav.logout")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          {isMobile && (
            <Button onClick={toggleSidebar} size="icon" variant="ghost">
              <Menu className="h-5 w-5" />
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}

export default DashboardHeader;
