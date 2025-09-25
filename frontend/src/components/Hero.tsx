"use client";

import { useI18n, useCurrentLocale } from "@/locales/client";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkle } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export default function Hero({className}:{className?:string}) {
  const t = useI18n();
  const locale = useCurrentLocale();

  return (
    <div className={cn(`relative overflow-hidden`, className)}>
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-b from-blue-50 to-white z-0"></div>
      <div className="absolute top-20 left-0 w-72 h-72 bg-primary/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl"></div>
      <div className="absolute -top-10 right-0 w-72 h-72 bg-purple-500/5 rounded-full blur-3xl"></div>

      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5 z-0"></div>

      {/* Hero Content */}
      <div className="container mx-auto px-4 py-12 md:py-24 relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-12">
          {/* Text Content */}
          <div className="w-full lg:w-1/2 space-y-6 text-center lg:text-left">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <span className="px-4 py-2 rounded-full bg-primary/10 text-primary font-semibold text-sm inline-block mb-4">
                {locale === "fr"
                  ? "La Plateforme E-learning N°1 au Cameroun"
                  : "#1 E-learning Platform in Cameroon"}
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-gray-900 leading-tight"
            >
              {t("hero.title")}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="text-xl text-gray-600 max-w-lg mx-auto lg:mx-0"
            >
              {t("hero.subtitle")}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
            >
              <Link href="/auth/register">
                <motion.div
                  whileHover={{ scale: 1.05, y: -3 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    size="lg"
                    className="bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20 font-semibold px-8 py-6 rounded-xl"
                  >
                    {t("hero.start")}
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </motion.div>
              </Link>

              <Link href="/features">
                <motion.div
                  whileHover={{ scale: 1.05, y: -3 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-primary/20 text-primary hover:bg-primary/5 font-semibold px-8 py-6 rounded-xl"
                  >
                    {t("hero.learnMore")}
                  </Button>
                </motion.div>
              </Link>
            </motion.div>

            {/* Trust Indicators */}
            {/* <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 1 }}
              className="pt-6 flex flex-wrap justify-center lg:justify-start gap-6 text-gray-500 text-sm"
            >
              <div className="flex items-center gap-1">
                <svg
                  viewBox="0 0 24 24"
                  className="h-5 w-5 text-yellow-500"
                  fill="currentColor"
                >
                  <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                </svg>
                <span>
                  <strong className="font-semibold text-gray-700">4.9/5</strong>{" "}
                  {locale === "fr"
                    ? "Satisfaction des étudiants"
                    : "Student satisfaction"}
                </span>
              </div>

              <div className="flex items-center gap-1">
                <svg
                  viewBox="0 0 24 24"
                  className="h-5 w-5 text-primary"
                  stroke="currentColor"
                  fill="none"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
                <span>
                  <strong className="font-semibold text-gray-700">5000+</strong>{" "}
                  {locale === "fr" ? "Étudiants actifs" : "Active students"}
                </span>
              </div>

              <div className="flex items-center gap-1">
                <svg
                  viewBox="0 0 24 24"
                  className="h-5 w-5 text-green-500"
                  stroke="currentColor"
                  fill="none"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
                <span>
                  <strong className="font-semibold text-gray-700">100%</strong>{" "}
                  {locale === "fr" ? "Paiement sécurisé" : "Secure payments"}
                </span>
              </div>
            </motion.div> */}
          </div>

          {/* Hero Image */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="w-full lg:w-1/2 relative"
          >
            <div className="relative aspect-[4/3] w-full max-w-lg mx-auto">
              {/* Main Image */}
              <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 p-3 md:p-6 overflow-hidden">
                <div className="relative w-full h-full rounded-xl overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
                  <Image
                    src="/images/hero-image.jpg"
                    alt="ClassConnect learning platform"
                    width={600}
                    height={450}
                    className="object-cover rounded-lg"
                    priority
                    onError={(e) => {
                      // Fallback for missing image
                      e.currentTarget.src =
                        "https://placehold.co/600x450/e2e8f0/64748b?text=ClassConnect";
                    }}
                  />
                </div>
              </div>

              {/* Floating Elements */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 0.5 }}
                className="absolute -top-6 -left-6 bg-white rounded-lg shadow-lg p-4 flex items-center gap-3 border border-gray-100"
              >
                <div className="bg-green-500 text-white p-2 rounded-lg">
                  <svg
                    viewBox="0 0 24 24"
                    width="20"
                    height="20"
                    stroke="currentColor"
                    fill="none"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                </div>
                <div className="text-sm">
                  <p className="font-semibold text-gray-900">
                    {locale === "fr"
                      ? "Apprentissage interactif"
                      : "Interactive learning"}
                  </p>
                  <p className="text-gray-500 text-xs">
                    {locale === "fr"
                      ? "Engageant et efficace"
                      : "Engaging & effective"}
                  </p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1, duration: 0.5 }}
                className="absolute -bottom-4 -right-4 md:-right-10 bg-white rounded-lg shadow-lg p-4 flex items-center gap-3 border border-gray-100"
              >
                <div className="bg-blue-500 text-white p-2 rounded-lg">
                  <svg
                    viewBox="0 0 24 24"
                    width="20"
                    height="20"
                    stroke="currentColor"
                    fill="none"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                    <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                  </svg>
                </div>
                <div className="text-sm">
                  <p className="font-semibold text-gray-900">
                    {locale === "fr" ? "Support 24/7" : "24/7 Support"}
                  </p>
                  <p className="text-gray-500 text-xs">
                    {locale === "fr"
                      ? "Toujours là pour vous"
                      : "Always there for you"}
                  </p>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}