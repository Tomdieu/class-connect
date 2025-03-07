import Footer from "@/components/Footer";
import Header from "@/components/Header";
import React from "react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-muted/30">
      <Header/>
      {children}
      <Footer/>
    </div>
  );
}
