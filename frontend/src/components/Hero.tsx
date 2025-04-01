"use client";
import React, { useState } from "react";
import { Button } from "./ui/button";
import { Play, UserCheck, Users, GraduationCap } from "lucide-react";
import { AboutContent } from "./AboutContent";
import { useI18n } from "@/locales/client";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useAuthDialog } from "@/hooks/use-auth-dialog";
import Image from "next/image";

function Hero() {
  const [showAbout, setShowAbout] = useState(false);
  const { openLogin } = useAuthDialog();
  const { data: session } = useSession();
  const t = useI18n();
  const router = useRouter();

  return (
    <div className="relative w-full overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-blue-100/50 backdrop-blur-sm" />
        <div className="absolute top-0 left-0 w-96 h-96 bg-blue-200/20 rounded-full filter blur-3xl transform -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-indigo-200/20 rounded-full filter blur-3xl transform translate-x-1/2 translate-y-1/2" />
      </div>

      <div className="relative flex flex-col gap-10 py-24 lg:py-32 w-full container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
          {/* Left side - Text content */}
          <div className="flex-1 flex flex-col items-center lg:items-start text-center lg:text-left gap-8">
            <div className="space-y-6">
              <h1 className="text-5xl lg:text-5xl xl:text-6xl font-bold text-gray-900 leading-tight">
                {t("hero.title")}
              </h1>
              <p className="text-xl text-gray-600 leading-relaxed max-w-2xl">
                {t("hero.subtitle")}
              </p>
            </div>
            <div className="flex items-center gap-4 flex-wrap justify-center lg:justify-start">
              <Button
                size="lg"
                onClick={() => {
                  if (session?.user) {
                    router.push("/dashboard");
                  } else {
                    openLogin();
                  }
                }}
                className="bg-default hover:bg-default/90 text-white rounded-xl px-8 h-14 text-lg"
              >
                {t("hero.start")}
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => setShowAbout(true)}
                className="rounded-xl px-8 h-14 text-lg border-default text-default hover:bg-default/10"
              >
                {t("hero.learnMore")}
              </Button>
            </div>
          </div>

          {/* Right side - Illustration */}
          <div className="flex-1 relative h-[400px] w-full max-w-xl">
            <div className="relative w-full h-full">
              <Image
                src="/images/hero-ilustration.png"
                alt="Education Illustration"
                width={600}
                height={400}
                className="w-full h-full object-contain"
                priority
                suppressHydrationWarning
              />
            </div>
          </div>
        </div>

        {/* Features grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mt-12">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-blue-100 hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-blue-100 rounded-xl">
                <Play className="h-6 w-6 text-default" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900">
                {t("features.interactive")}
              </h3>
            </div>
            <p className="text-gray-600 leading-relaxed">
              {t("features.interactive.desc")}
            </p>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-blue-100 hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-blue-100 rounded-xl">
                <UserCheck className="h-6 w-6 text-default" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900">
                {t("features.personalized")}
              </h3>
            </div>
            <p className="text-gray-600 leading-relaxed">
              {t("features.personalized.desc")}
            </p>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-blue-100 hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-blue-100 rounded-xl">
                <Users className="h-6 w-6 text-default" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900">
                {t("features.community")}
              </h3>
            </div>
            <p className="text-gray-600 leading-relaxed">
              {t("features.community.desc")}
            </p>
          </div>
        </div>
      </div>

      {showAbout && <AboutContent onClose={() => setShowAbout(false)} />}
    </div>
  );
}

export default Hero;
