"use client"
import React, { useState } from "react";
import { Button } from "./ui/button";
import { Play, UserCheck, Users } from "lucide-react";
// import { useMediaQuery } from "usehooks-ts";
import { AboutContent } from "./AboutContent";
import { useI18n } from "@/locales/client";
import { useRouter } from "next/navigation";

function Hero() {
  // const isMobile = useMediaQuery('(max-width: 640px)')
  const [showAbout, setShowAbout] = useState(false);
  const t = useI18n()
  const router = useRouter()
  return (
    <div className="flex flex-col gap-10 py-20 bg-[#F0F9FF]">
      <div className="flex items-center justify-center text-black flex-col gap-8">
        <h1 className="max-w-xl 2xl:max-w-3xl text-3xl lg:text-4xl 2xl:text-5xl font-bold text-gray-900 leading-tight text-center">
          {t("hero.title")}
        </h1>
        <p className="text-lg lg:text-xl text-gray-600 leading-relaxed text-center max-w-xl">
          {/* Une plateforme d&apos;apprentissage en ligne adaptée à vos besoins,
          avec des cours
          <br /> de qualité et un suivi personnalisé. */}
          {t("hero.subtitle")}
        </p>
        <div className="flex items-center justify-between gap-6">
          <Button
            size={"lg"}
            onClick={()=>router.push('/dashboard')}
            className="bg-default hover:bg-default/80 text-white rounded-md"
          >
            {t("hero.start")}
          </Button>
          <Button
            size={"lg"}
            variant={"outline"}
            onClick={() => setShowAbout(true)}
            className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 border bg-neutral-50 hover:text-default h-11 rounded-md px-8 border-[#0EA5E9] text-[#0EA5E9] hover:bg-[#D3E4FD]"
          >
            {t("hero.learnMore")} 
          </Button>
        </div>
      </div>
      <div className="mt-20 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 text-center px-5">
        <div className="p-6 bg-white rounded-xl shadow-sm border border-[#0EA5E9]/20">
          <div className="flex justify-center mb-4">
            <Play className="h-8 w-8 text-[#0EA5E9]" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {t("features.interactive")}
          </h3>
          <p className="text-gray-600">
            {t("features.interactive.desc")}
          </p>
        </div>
        <div className="p-6 bg-white rounded-xl shadow-sm border border-[#0EA5E9]/20">
          <div className="flex justify-center mb-4">
            <UserCheck className="h-8 w-8 text-[#0EA5E9]" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {t("features.personalized")}
          </h3>
          <p className="text-gray-600">
            {t("features.personalized.desc")}
          </p>
        </div>
        <div className="p-6 bg-white rounded-xl shadow-sm border border-[#0EA5E9]/20">
          <div className="flex justify-center mb-4">
            <Users className="h-8 w-8 text-[#0EA5E9]" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {t("features.community")}
          </h3>
          <p className="text-gray-600">
            {t("features.community.desc")}
          </p>
        </div>
      </div>
      {showAbout && <AboutContent onClose={() => setShowAbout(false)} />}
    </div>
  );
}

export default Hero;
