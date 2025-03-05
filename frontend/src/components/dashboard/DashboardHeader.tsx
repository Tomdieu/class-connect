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
import { LogOut, Settings, User } from "lucide-react";
import Link from "next/link";
import { getFullName } from "@/lib/utils";
import { Button } from "../ui/button";
import { signOut, useSession } from "next-auth/react";
import { UserType } from "@/types";

interface DashboardHeaderProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  actions?: ReactNode;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  title,
  description,
  icon,
  actions,
}) => {
  // Get user session for the profile dropdown

  const { data: session } = useSession();
  const user = session?.user;

  const initials = user
    ? `${user.first_name?.[0] || ""}${user.last_name?.[0] || ""}`.toUpperCase()
    : "??";

  const userName = user ? getFullName(user as UserType) : "User";

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b mb-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight flex items-center">
          {icon && <span className="mr-2">{icon}</span>}
          {title}
        </h1>
        {description && <p className="text-muted-foreground">{description}</p>}
      </div>

      <div className="flex items-center gap-4">
        {actions && <div className="flex items-center gap-2">{actions}</div>}

        {user && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="relative h-9 w-9 rounded-full"
                aria-label="User menu"
              >
                <Avatar className="h-9 w-9">
                  <AvatarImage
                    src={user.profile_picture || ""}
                    alt={userName}
                  />
                  <AvatarFallback>{initials}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end">
              <div className="flex items-center justify-start gap-2 p-2">
                <div className="flex flex-col space-y-0.5">
                  <p className="text-sm font-medium">{userName}</p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                </div>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link
                  href="/students/profile"
                  className="w-full cursor-pointer"
                >
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link
                  href="/students/settings"
                  className="w-full cursor-pointer"
                >
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={() => signOut({ callbackUrl: "/" })}
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </div>
  );
};

export default DashboardHeader;
