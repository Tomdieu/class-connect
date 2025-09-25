import { useCurrentLocale, useI18n } from '@/locales/client';
import React, { useEffect, useState } from 'react'
import { motion } from "framer-motion";
import FeatureCard from './FeatureCard';
import { MessageCircle, Play, Star, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

function FeaturesSection({ className }: { className?: string }) {
  const locale = useCurrentLocale();
  const t = useI18n();

  return (
    <section className={cn("min-h-screen flex items-center justify-center bg-gradient-to-b from-white via-blue-50/50 to-white relative overflow-hidden", className)}>
      <div className="absolute top-0 left-1/4 w-72 h-72 bg-primary/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-indigo-500/5 rounded-full blur-3xl"></div>

      <div className="container mx-auto px-4 py-20 md:py-32 w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center px-4 py-2  rounded-full border border-blue-600/15">
            <span className="text-primary font-semibold tracking-wider uppercase mb-2 block">
              {locale === "fr" ? "POURQUOI NOUS CHOISIR" : "WHY CHOOSE US"}
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-5 tracking-tight">
            {t("features.title")}
          </h2>
          <div className="w-24 h-1.5 bg-primary mx-auto rounded-full mb-5"></div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            {locale === "fr"
              ? "Notre plateforme innovante combine technologie et pédagogie pour offrir une expérience d'apprentissage exceptionnelle"
              : "Our innovative platform combines technology and pedagogy to deliver an exceptional learning experience"}
          </p>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <FeatureCard
            icon={<Users className="h-7 w-7" />}
            color="bg-gradient-to-r from-primary to-primary-600"
            title={locale === "fr" ? "Apprentissage Personnalisé" : "Personalized Learning"}
            description={locale === "fr"
              ? "Contenu adapté à votre niveau et vos objectifs pour des progrès optimaux"
              : "Content tailored to your level and goals for optimal progress"}
            delay={0.1}
          />
          <FeatureCard
            icon={<Play className="h-7 w-7" />}
            color="bg-gradient-to-r from-sky-500 to-blue-600"
            title={locale === "fr" ? "Cours Interactifs" : "Interactive Courses"}
            description={locale === "fr"
              ? "Des vidéos, quiz et exercices pratiques qui rendent l'apprentissage captivant"
              : "Videos, quizzes and practical exercises that make learning engaging"}
            delay={0.2}
          />
          <FeatureCard
            icon={<Star className="h-7 w-7" />}
            color="bg-gradient-to-r from-amber-500 to-orange-600"
            title={locale === "fr" ? "Experts Qualifiés" : "Qualified Experts"}
            description={locale === "fr"
              ? "Enseignants expérimentés dédiés à votre réussite académique"
              : "Experienced teachers dedicated to your academic success"}
            delay={0.3}
          />
          <FeatureCard
            icon={<MessageCircle className="h-7 w-7" />}
            color="bg-gradient-to-r from-emerald-500 to-green-600"
            title={locale === "fr" ? "Communauté Active" : "Active Community"}
            description={locale === "fr"
              ? "Échangez avec d'autres étudiants et enseignants pour un apprentissage collaboratif"
              : "Engage with other students and teachers for collaborative learning"}
            delay={0.4}
          />
        </div>
      </div>
    </section>
  )
}

export default FeaturesSection