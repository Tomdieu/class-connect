"use client";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import { SubscriptionPlans } from "@/components/SubscriptionPlans";
import React from "react";

function LandingPage() {
  return (
    <div className="relative flex-1 w-full h-full flex flex-col px-3 sm:container mx-auto">
      <Header className=" bg-white" />
      <Hero />
      <SubscriptionPlans />
    </div>
  );
}

export default LandingPage;
