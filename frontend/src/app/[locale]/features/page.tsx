"use client";

import React from 'react';
import { useI18n, useCurrentLocale } from '@/locales/client';
import { motion } from 'framer-motion';
import { Features } from '@/components/about/Features';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function FeaturesPage() {
  const t = useI18n();
  const locale = useCurrentLocale();

  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <Header className="fixed top-0 left-0 right-0 shadow-md bg-white/95 backdrop-blur-md border-b border-gray-100 px-5 z-[99999999]" />
      {/* Add a spacer to push content below the fixed header */}
      <div className="h-20 mt-10 md:mt-0 md:h-20"></div>

      <main>
        <div className="container mx-auto px-4 py-8">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeIn}
            className="flex items-center justify-between mb-8"
          >
            <Link href="/">
              <Button variant="outline" className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                {locale === "fr" ? "Retour à l'accueil" : "Back to Home"}
              </Button>
            </Link>
          </motion.div>

          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeIn}
            className="text-center mb-12"
          >
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              {locale === "fr" ? "Nos Fonctionnalités" : "Our Features"}
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {locale === "fr"
                ? "Découvrez toutes les fonctionnalités avancées qui font de ClassConnect la plateforme d'apprentissage en ligne de référence au Cameroun."
                : "Discover all the advanced features that make ClassConnect the leading online learning platform in Cameroon."
              }
            </p>
          </motion.div>
        </div>

        {/* Features Section */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          className="container mx-auto px-4 pb-16"
        >
          <Features />
        </motion.div>

        {/* Call to Action */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          className="bg-primary/5 py-16"
        >
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              {locale === "fr" ? "Prêt à commencer ?" : "Ready to get started?"}
            </h2>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              {locale === "fr"
                ? "Rejoignez des milliers d'étudiants qui transforment déjà leur apprentissage avec ClassConnect."
                : "Join thousands of students who are already transforming their learning with ClassConnect."
              }
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth/register">
                <Button size="lg" className="bg-primary hover:bg-primary/90 text-white px-8">
                  {locale === "fr" ? "Commencer maintenant" : "Get Started Now"}
                </Button>
              </Link>
              <Link href="/about">
                <Button size="lg" variant="outline" className="px-8">
                  {locale === "fr" ? "En savoir plus" : "Learn More"}
                </Button>
              </Link>
            </div>
          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}
