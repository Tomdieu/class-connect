import { useCurrentLocale } from '@/locales/client';
import React, { Suspense } from 'react'
import { motion } from "framer-motion";
import { CheckCircle2, Clock, LucideBook, Users } from 'lucide-react';
import StatCardSkeleton from './StatCardSkeleton';
import StatCard from './StatCard';
import CountUpNumber from './CountUpNumber';


function StatsSection() {
        const locale = useCurrentLocale();
  return (
    <section className="py-20 bg-gradient-to-b from-blue-50/70 to-white relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-b from-blue-50/70 to-transparent"></div>
          <div className="absolute top-40 left-60 w-72 h-72 rounded-full bg-primary/5 blur-3xl"></div>
          <div className="absolute bottom-10 right-40 w-80 h-80 rounded-full bg-blue-500/5 blur-3xl"></div>

          <div className="container mx-auto px-4 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <span className="text-primary font-semibold tracking-wider uppercase mb-2 block">
                {locale === "fr" ? "NOTRE IMPACT" : "OUR IMPACT"}
              </span>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-5 tracking-tight">
                {locale === "fr" ? "En Chiffres" : "By The Numbers"}
              </h2>
              <div className="w-24 h-1.5 bg-primary mx-auto rounded-full mb-5"></div>
            </motion.div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
              <Suspense fallback={<StatCardSkeleton />}>
                <StatCard
                  icon={<Users className="h-8 w-8" />}
                  value={<CountUpNumber value={5000} suffix="+" />}
                  label={locale === "fr" ? "Étudiants Actifs" : "Active Students"}
                  delay={0.1}
                  gradient="bg-gradient-to-br from-primary to-primary-600"
                />
              </Suspense>
              <Suspense fallback={<StatCardSkeleton />}>
                <StatCard
                  icon={<LucideBook className="h-8 w-8" />}
                  value={<CountUpNumber value={350} suffix="+" />}
                  label={locale === "fr" ? "Cours de Qualité" : "Quality Courses"}
                  delay={0.2}
                  gradient="bg-gradient-to-br from-sky-500 to-blue-600"
                />
              </Suspense>
              <Suspense fallback={<StatCardSkeleton />}>
                <StatCard
                  icon={<CheckCircle2 className="h-8 w-8" />}
                  value={<CountUpNumber value={98} suffix="%" />}
                  label={
                    locale === "fr" ? "Taux de Satisfaction" : "Satisfaction Rate"
                  }
                  delay={0.3}
                  gradient="bg-gradient-to-br from-amber-500 to-orange-600"
                />
              </Suspense>
              <Suspense fallback={<StatCardSkeleton />}>
                <StatCard
                  icon={<Clock className="h-8 w-8" />}
                  value="24/7"
                  label={
                    locale === "fr" ? "Support Disponible" : "Available Support"
                  }
                  delay={0.4}
                  gradient="bg-gradient-to-br from-emerald-500 to-green-600"
                />
              </Suspense>
            </div>
          </div>
        </section>
  )
}

export default StatsSection