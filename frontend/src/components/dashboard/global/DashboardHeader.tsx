"use client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useSidebar } from "@/components/ui/sidebar";
import { BookOpen, ChevronDown, LogOut, MenuIcon } from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

function DashboardHeader() {
  const { toggleSidebar } = useSidebar();
  const { data: session } = useSession();
  const getInitials = (name: string) => {
    const [firstName, lastName] = name.split(" ");
    return firstName[0] + lastName[0];
  };

  return (
    <div className="sticky top-0 z-50 shadow-lg w-full flex items-center justify-between p-3">
      <Link
        href={"/dashboard"}
        className="select-none flex items-center gap-1 cursor-pointer text-blue-600"
      >
        <BookOpen className="size-5 sm:size-8" />
        <h1 className="font-black text-sm sm:text-lg">ClassConnect</h1>
      </Link>
      <div className="flex items-center gap-2">
        <Avatar>
          <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
          <AvatarFallback>
            {getInitials(
              `${session?.user.first_name} ${session?.user.last_name}`
            )}
          </AvatarFallback>
        </Avatar>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className="flex flex-col gap-0.5 cursor-pointer select-none">
              <span className="text-muted-foreground text-xs">Bonjour</span>
              <div className="flex items-center gap-1">
                <span className="text-sm">{session?.user.first_name}</span>
                <ChevronDown className="size-4" />
              </div>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem>
                Profile
                <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
              </DropdownMenuItem>
              <DropdownMenuItem>
                Billing
                <DropdownMenuShortcut>⌘B</DropdownMenuShortcut>
              </DropdownMenuItem>
              <DropdownMenuItem>
                Settings
                <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
              </DropdownMenuItem>
              {session?.user.is_staff && (
                <DropdownMenuItem>
                  <Link href={"/admin"}>Admin Dashboard</Link>
                </DropdownMenuItem>
              )}
            </DropdownMenuGroup>
            <DropdownMenuSeparator />

            <DropdownMenuSeparator />
            <DropdownMenuItem>GitHub</DropdownMenuItem>
            <DropdownMenuItem>Support</DropdownMenuItem>
            <DropdownMenuItem disabled>API</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => signOut()}>
              Log out
              <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

export default DashboardHeader;
