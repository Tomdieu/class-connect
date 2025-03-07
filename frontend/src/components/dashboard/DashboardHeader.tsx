"use client";

import React, { ReactNode } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Home, LogOut, Settings, User } from "lucide-react";
import Link from "next/link";
import { getFullName } from "@/lib/utils";
import { Button } from "../ui/button";
import { signOut } from "next-auth/react";
import { useSession } from "next-auth/react";
import { UserType } from "@/types";
import { useI18n } from "@/locales/client";

interface DashboardHeaderProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  actions?: ReactNode;
  showNavigation?: boolean;
  currentPath?: string;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  title,
  description,
  icon,
  actions,
  showNavigation = true,
  currentPath,
}) => {
  // Get user session for the profile dropdown using useSession hook
  const { data: session } = useSession();
  const t = useI18n();
  const user = session?.user;
  
  const initials = user ? 
    `${user.first_name?.[0] || ''}${user.last_name?.[0] || ''}`.toUpperCase() 
    : '??';

  const userName = user ? getFullName(user as UserType) : 'User';

  return (
    <div className="flex flex-col gap-4">
      {/* Top navigation bar */}
      {showNavigation && (
        <div className="flex items-center justify-between bg-muted/20 p-2 px-4 rounded-md mb-2">
          <div className="flex items-center gap-2">
            <Link href="/students" className="flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors">
              <Home className="h-4 w-4 mr-1" />
              {t('common.dashboard')}
            </Link>
            {currentPath && (
              <>
                <span className="text-muted-foreground">/</span>
                <span className="text-sm">{currentPath}</span>
              </>
            )}
          </div>
          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2 h-9 px-3 py-2" aria-label="User menu">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={user.profile_picture || ''} alt={userName} />
                    <AvatarFallback>{initials}</AvatarFallback>
                  </Avatar>
                  <span className="hidden sm:inline">{userName}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end">
                <div className="flex items-center justify-start gap-2 p-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.profile_picture || ''} alt={userName} />
                    <AvatarFallback>{initials}</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col space-y-0.5">
                    <p className="text-sm font-medium">{userName}</p>
                    <p className="text-xs text-muted-foreground truncate max-w-[180px]">{user.email}</p>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/students" className="w-full cursor-pointer">
                    <Home className="mr-2 h-4 w-4" />
                    <span>{t('common.dashboard')}</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/students/profile" className="w-full cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    <span>{t('nav.profile')}</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/students/settings" className="w-full cursor-pointer">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>{t('dashboardPage.settings')}</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  className="cursor-pointer"
                  onClick={() => signOut({ callbackUrl: '/' })}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>{t('nav.logout')}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      )}

      {/* Main header content */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b mb-6">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight flex items-center">
            {icon && <span className="mr-2">{icon}</span>}
            {title}
          </h1>
          {description && (
            <p className="text-muted-foreground">{description}</p>
          )}
        </div>
        
        <div className="flex items-center gap-4">
          {actions && <div className="flex items-center gap-2">{actions}</div>}
          
         
        </div>
      </div>
    </div>
  );
};

export default DashboardHeader;
