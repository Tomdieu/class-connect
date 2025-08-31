"use client";
import { BookOpen, LogIn, UserPlus } from "lucide-react";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { useMediaQuery } from "usehooks-ts";
import ChangeLanguage from "./ChangeLanguage";
import { cn } from "@/lib/utils";
import { signOut, useSession } from "next-auth/react";
import { useI18n } from "@/locales/client";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { ChevronDown, User, Settings, LogOut } from "lucide-react";

function Header({ className }: { className?: string }) {
  // Initial state with a default value
  const [isMounted, setIsMounted] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const isMobile = useMediaQuery("(max-width: 640px)");
  const { data: session } = useSession();
  const t = useI18n();
  const router = useRouter();

  // Set isMounted to true when component mounts
  useEffect(() => {
    setIsMounted(true);

    // Add scroll listener to apply shadow on scroll
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Skip rendering responsive elements until component is mounted
  // This ensures hydration doesn't mismatch
  if (!isMounted) {
    return (
      <header
        className={cn(
          "w-full sticky top-0 z-40 transition-all duration-200",
          className
        )}
      >
        <div className="container mx-auto flex items-center justify-between h-16 px-4">
          <Link
            href="/"
            className="flex items-center gap-2 text-primary transition-colors hover:opacity-90"
            aria-label="Home"
          >
            <div className="bg-primary/10 p-1.5 rounded-full">
              <BookOpen className="h-5 w-5 text-primary" />
            </div>
            <span className="font-bold text-xl hidden sm:inline-block">
              ClassConnect
            </span>
          </Link>
          <div className="flex items-center gap-3 sm:gap-6">
            {/* Empty skeleton to maintain layout during initial render */}
          </div>
        </div>
      </header>
    );
  }

  // Handle logout
  const handleLogout = () => {
    // router.push("/api/auth/signout");
    signOut({ redirectTo: "/" });
  };

  const goToProfile = () => {
    if (session?.user.role === "admin") {
      router.push("/admin/profile");
    } else if (session?.user.role === "teacher") {
      router.push("/dashboard/profile");
    } else if (session?.user.role === "student") {
      router.push("/students/profile");
    } else {
      // Handle cases where the role is not recognized
    }
  };

  // Get user initials for avatar fallback
  const getUserInitials = () => {
    if (!session?.user?.first_name) return "CC";

    const firstInitial = session.user.first_name.charAt(0);
    const lastInitial = session.user.last_name?.charAt(0) || firstInitial;
    
    return `${firstInitial}${lastInitial}`.toUpperCase();
  };

  return (
    <header
      className={cn(
        "w-full sticky top-0 z-50 transition-all duration-200", // increased z-index from 40 to 50
        isScrolled
          ? "bg-background/95 backdrop-blur-md shadow-sm border-b border-border/40"
          : "bg-transparent",
        className
      )}
    >
      <div className="container mx-auto flex items-center justify-between h-16 px-4">
        <Link
          href="/"
          className="flex items-center gap-2 text-primary transition-colors hover:opacity-90"
          aria-label="Home"
        >
          <div className="bg-primary/10 p-1.5 rounded-full">
            <BookOpen className="h-5 w-5 text-primary" />
          </div>
          <span className="font-bold text-xl hidden sm:inline-block">
            ClassConnect
          </span>
        </Link>

        <div className="flex items-center gap-3 sm:gap-5">
          {!session?.user ? (
            <>
              <Link href={"/auth/login"}>
                <Button
                  variant="ghost"
                  // size={isMobile ? "sm" : "default"}
                  size={"default"}

                  className="text-foreground hover:text-primary hover:bg-primary/10 font-medium flex items-center"
                >
                  <LogIn className="h-4 w-4 sm:mr-2" />
                  <span 
                  // className={isMobile ? "sr-only" : "inline-block"}
                  >
                    {t("nav.login")}
                  </span>
                </Button>
              </Link>

              <Link href={"/auth/register"}>
                <Button
                  // size={isMobile ? "sm" : "default"}
                  size={"default"}

                  className="bg-primary hover:bg-primary/90 text-white font-medium transition-colors flex items-center gap-2"
                >
                  <UserPlus className="h-4 w-4 sm:mr-1" />
                  <span 
                  // className={isMobile ? "sr-only" : "inline-block"}
                  className={"inline-block"}
                  >
                    {t("nav.register")}
                  </span>
                </Button>
              </Link>
            </>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="p-1 sm:p-2 h-auto flex items-center gap-2 hover:bg-primary/10 rounded-full sm:rounded-lg"
                >
                  <Avatar className="h-8 w-8 border border-border">
                    <AvatarImage
                      src={session.user.avatar || undefined}
                      alt={session.user.name || "User"}
                    />
                    <AvatarFallback className="bg-primary/20 text-primary font-medium">
                      {getUserInitials()}
                    </AvatarFallback>
                  </Avatar>

                  {!isMobile && (
                    <>
                      <span className="font-medium text-sm">
                        {session.user.name?.split(" ")[0] || "User"}
                      </span>
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    </>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-2 py-2 text-sm flex flex-col font-medium text-left text-muted-foreground">
                  <span className="font-bold text-sm">
                    {session.user.first_name} {session.user.last_name}
                  </span>
                  <span>{session.user.email}</span>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => router.push("/redirect")}
                  className="cursor-pointer"
                >
                  <User className="h-4 w-4 mr-2" />
                  Dashboard
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => goToProfile()}
                  className="cursor-pointer"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  {t("nav.profile")}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="cursor-pointer text-destructive focus:text-destructive"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  {t("nav.logout")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          <div
            className={cn(
              "border-l border-border/60 pl-3",
              isMobile ? "hidden" : "block"
            )}
          >
            <ChangeLanguage />
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
