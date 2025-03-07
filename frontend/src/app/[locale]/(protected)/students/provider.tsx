"use client";
import { getUserRole } from "@/lib/utils";
import { UserType } from "@/types";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import React, { PropsWithChildren, useEffect } from "react";

function StudentProvider({ children }: PropsWithChildren) {
  const { data: session } = useSession();

  useEffect(() => {
    // You can add additional role checking here if needed
    if (session?.user) {
      if (getUserRole(session?.user as UserType) !== "student") {
        redirect("/");
      }
    }
  }, [session?.user]);
  return <React.Fragment>{children}</React.Fragment>;
}

export default StudentProvider;
