"use client"
import React, { useState } from "react";
import { Button } from "./ui/button";
import { Play, UserCheck, Users } from "lucide-react";
import { useMediaQuery } from "usehooks-ts";
import { AboutContent } from "./AboutContent";

function Hero() {
  const isMobile = useMediaQuery('(max-width: 640px)')
  const [showAbout, setShowAbout] = useState(false);
  return (
    <div className="flex flex-col gap-10 py-20 bg-[#F0F9FF]">
      <div className="flex items-center justify-center text-black flex-col gap-8">
        <h1 className="text-3xl lg:text-4xl 2xl:text-5xl font-bold text-gray-900 leading-tight text-center">
          Apprenez à votre rythme avec
          <br /> ClassConnect
        </h1>
        <p className="text-lg lg:text-xl text-gray-600 leading-relaxed text-center">
          Une plateforme d&apos;apprentissage en ligne adaptée à vos besoins,
          avec des cours
          <br /> de qualité et un suivi personnalisé.
        </p>
        <div className="flex items-center justify-between gap-6">
          <Button
            size={"lg"}
            className="bg-default hover:bg-default/80 text-white rounded-md"
          >
            Commencer
          </Button>
          <Button
            size={"lg"}
            variant={"outline"}
            onClick={() => setShowAbout(true)}
            className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 border bg-neutral-50 hover:text-default h-11 rounded-md px-8 border-[#0EA5E9] text-[#0EA5E9] hover:bg-[#D3E4FD]"
          >
            En savoir plus
          </Button>
        </div>
      </div>
      <div className="mt-20 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 text-center px-5">
        <div className="p-6 bg-white rounded-xl shadow-sm border border-[#0EA5E9]/20">
          <div className="flex justify-center mb-4">
            <Play className="h-8 w-8 text-[#0EA5E9]" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Cours interactifs
          </h3>
          <p className="text-gray-600">
            Apprenez avec des contenus multimédias et des exercices pratiques
          </p>
        </div>
        <div className="p-6 bg-white rounded-xl shadow-sm border border-[#0EA5E9]/20">
          <div className="flex justify-center mb-4">
            <UserCheck className="h-8 w-8 text-[#0EA5E9]" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Suivi personnalisé
          </h3>
          <p className="text-gray-600">
            Progressez à votre rythme avec des recommandations adaptées
          </p>
        </div>
        <div className="p-6 bg-white rounded-xl shadow-sm border border-[#0EA5E9]/20">
          <div className="flex justify-center mb-4">
            <Users className="h-8 w-8 text-[#0EA5E9]" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Communauté active
          </h3>
          <p className="text-gray-600">
            Échangez avec d&apos;autres apprenants et des experts
          </p>
        </div>
      </div>
      {showAbout && <AboutContent onClose={() => setShowAbout(false)} />}
    </div>
  );
}

export default Hero;
