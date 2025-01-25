"use client";
import { BookOpen, LogIn, UserPlus } from "lucide-react";
import Link from "next/link";
import React from "react";
import { Button } from "./ui/button";
import { useAuthDialog } from "@/hooks/use-auth-dialog";
// import { ModeToggle } from './ModeToggle';
import { useMediaQuery } from "usehooks-ts";
import ChangeLanguage from "./ChangeLanguage";
import { cn } from "@/lib/utils";
import { useSession } from "next-auth/react";

function Header({ className }: { className?: string }) {
  const { openLogin, openRegister } = useAuthDialog();
  const isMobile = useMediaQuery("(max-width: 640px)");
  const { data: session } = useSession();
  return (
    <div className={cn("flex items-center justify-between py-5", className)}>
      <Link
        href={"/"}
        className="select-none flex items-center gap-1 cursor-pointer text-blue-600"
      >
        <BookOpen className="size-6 sm:size-8" />
        <h1 className="font-black text-base sm:text-lg text-blue-600">
          ClassConnect
        </h1>
      </Link>
      <div className="flex items-center gap-1 2xl:gap-5">
        {!session?.user && (
          <>
            <Button
              variant={"outline"}
              size={isMobile ? "default" : "default"}
              onClick={openLogin}
              className="text-black hover:text-blue-600 hover:bg-primary/10 border"
            >
              <LogIn className="hidden" />
              <span className="text-xs sm:text-sm">Se Connecter</span>
            </Button>
            <Button
              size={isMobile ? "default" : "default"}
              onClick={openRegister}
              className="bg-default text-sm hover:bg-default/80 text-white"
            >
              <UserPlus className="hidden" />
              <span className="text-xs sm:text-sm">S&apos;inscrire</span>
            </Button>
          </>
        )}

        {!isMobile && <ChangeLanguage />}
        {/* <ModeToggle/> */}
      </div>
    </div>
  );
}

export default Header;
