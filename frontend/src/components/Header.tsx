"use client";
import { BookOpen, LogIn, UserPlus } from "lucide-react";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { useMediaQuery } from "usehooks-ts";
import ChangeLanguage from "./ChangeLanguage";
import { cn } from "@/lib/utils";
import { useSession } from "next-auth/react";
import { useI18n } from "@/locales/client";
import { useRouter } from "next/navigation";

function Header({ className }: { className?: string }) {
  // Initial state with a default value
  const [isMounted, setIsMounted] = useState(false);
  const isMobile = useMediaQuery("(max-width: 640px)");
  const { data: session } = useSession();
  const t = useI18n();
  const router = useRouter();

  // Set isMounted to true when component mounts
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Skip rendering responsive elements until component is mounted
  // This ensures hydration doesn't mismatch
  if (!isMounted) {
    return (
      <header className={cn("w-full", className)}>
        <div className="container mx-auto flex items-center justify-between h-16 px-4">
          <Link
            href="/"
            className="flex items-center gap-2 text-default transition-colors hover:opacity-90"
            aria-label="Home"
          >
            <BookOpen className="h-7 w-7" />
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

  return (
    <header className={cn("w-full", className)}>
      <div className="container mx-auto flex items-center justify-between h-16 px-4">
        <Link
          href="/"
          className="flex items-center gap-2 text-default transition-colors hover:opacity-90"
          aria-label="Home"
        >
          <BookOpen className="h-7 w-7" />
          <span className="font-bold text-xl hidden sm:inline-block">
            ClassConnect
          </span>
        </Link>

        <div className="flex items-center gap-3 sm:gap-6">
          {!session?.user ? (
            <>
              <Link href={"/auth/login"}>
                <Button
                  variant="ghost"
                  size={isMobile ? "sm" : "default"}
                  className="text-gray-700 hover:text-default hover:bg-blue-50"
                >
                  <LogIn className="h-4 w-4 sm:mr-2" />
                  <span className={isMobile ? "" : "inline-block"}>{t("nav.login")}</span>
                </Button>
              </Link>

              <Link href={"/auth/register"}>
                <Button
                  size={isMobile ? "sm" : "default"}
                  className="bg-default hover:bg-default/90 text-white flex items-center gap-2"
                >
                  <UserPlus className="h-4 w-4 sm:mr-2" />
                  <span className={isMobile ? "" : "inline-block"}>{t("nav.register")}</span>
                </Button>
              </Link>
            </>
          ) : (
            <Button
              variant="ghost"
              className="text-gray-700 hover:text-default hover:bg-blue-50"
              onClick={() => router.push("/redirect")}
            >
              Dashboard
            </Button>
          )}

          {!isMobile && (
            <div className="border-l pl-4 border-gray-200">
              <ChangeLanguage />
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;