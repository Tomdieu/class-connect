import Footer from "@/components/Footer";
import Header from "@/components/Header";
import React from "react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 via-background to-background flex flex-col">
      <Header className="bg-transparent" />
      <main className="">
        {children}
      </main>
      <Footer />
    </div>
  );
}
