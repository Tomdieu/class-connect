"use client";
import { getUserRole } from "@/lib/utils";
import { UserType } from "@/types";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import React, { useEffect } from "react";

function ProtectedPage() {
  const { data: session } = useSession();
  useEffect(() => {
    // You can add additional role checking here if needed
    if (session?.user) {
      if (getUserRole(session?.user as UserType) === "student") {
        redirect("/students");
      }
      if (getUserRole(session?.user as UserType) === "teacher") {
        redirect("/dashboard");
      }
      if (getUserRole(session?.user as UserType) === "admin") {
        redirect("/admin");
      }
    } else {
      redirect("/auth/login");
    }
  }, [session?.user]);
  return <React.Fragment></React.Fragment>;
}

export default ProtectedPage;
