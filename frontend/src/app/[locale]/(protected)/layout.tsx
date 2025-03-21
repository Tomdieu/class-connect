"use client";
import InactivityProvider from "@/providers/InactivityProvider";
import React, { PropsWithChildren } from "react";

function ProtectedLayout({ children }: PropsWithChildren) {
  return (
    <React.Fragment>
      <InactivityProvider>{children}</InactivityProvider>
    </React.Fragment>
  );
}

export default ProtectedLayout;
