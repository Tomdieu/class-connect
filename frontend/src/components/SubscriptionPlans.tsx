"use client";

import { useI18n } from "@/locales/client";
import { Button } from "@/components/ui/button";
import { ChevronRight, Crown, Shield, Star, Sparkle, Check } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useMemo, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { getSubscriptionPlanByIdorSlug } from "@/actions/payments";

// Define type for particle properties in this component
interface SubscriptionParticleProps {
  id: number;
  width: number;
  height: number;
  x: string;
  y: string;
  duration: number;
  delay: number;
}

export function SubscriptionPlans() {
  const t = useI18n();
  const { data: session } = useSession();
  // State for storing particle properties, initialized client-side
  const [subscriptionParticles, setSubscriptionParticles] = useState<SubscriptionParticleProps[] | null>(null);

  const getUrl = (path: string) => {
    if (session?.user) {
      return path;
    } else {
      return `/auth/register?callbackUrl=${path}`;
    }
  };

  // Mock data for when API data isn't available
  const plansMockData = useMemo(() => [
    {
      id: "basic",
      name: t("subscriptionPlans.basic.name"),
      description: t("subscriptionPlans.basic.description"),
      price: "1 000",
      currency: "FCFA",
      period: "/month",
      features: [
        "Accès aux cours de base",
        "Forum communautaire",
        "Ressources d'apprentissage limitées",
      ],
      highlightFeatures: [] as number[],
      variant: "basic",
      icon: <Shield className="h-5 w-5" />,
      gradient: "from-blue-400 to-blue-600",
      bgClass: "bg-gradient-to-br from-blue-50 to-blue-100/50",
      buttonClass: "bg-blue-500 hover:bg-blue-600",
      headerClass: "bg-gradient-to-r from-blue-400 to-blue-600",
    },
    {
      id: "standard",
      name: t("subscriptionPlans.standard.name"),
      description: t("subscriptionPlans.standard.description"),
      price: "2 500",
      currency: "FCFA",
      period: "/month",
      features: [
        "Toutes les fonctionnalités Basiques",
        "Accès à plus de cours",
        "Sessions Q&R hebdomadaires",
        "Téléchargement des ressources",
      ],
      highlightFeatures: [1, 2] as number[],
      popular: true,
      variant: "standard",
      icon: <Star className="h-5 w-5" />,
      gradient: "from-primary-500 to-primary-600",
      bgClass: "bg-green-500",
      buttonClass: "bg-primary hover:bg-primary/90",
      headerClass: "bg-gradient-to-r from-primary-500 to-primary-600",
    },
    {
      id: "premium",
      name: t("subscriptionPlans.premium.name"),
      description: t("subscriptionPlans.premium.description"),
      price: "5 000",
      currency: "FCFA",
      period: "/month",
      features: [
        "Toutes les fonctionnalités Standard",
        "Accès à tous les cours",
        "Sessions vidéo illimitées",
        "Support prioritaire",
        "Contenu exclusif",
      ],
      highlightFeatures: [2, 3, 4] as number[],
      bestValue: true,
      variant: "premium",
      icon: <Crown className="h-5 w-5" />,
      gradient: "from-amber-400 to-amber-600",
      bgClass: "bg-gradient-to-br from-amber-50 to-amber-100/50",
      buttonClass: "bg-amber-500 hover:bg-amber-600",
      headerClass: "bg-gradient-to-r from-amber-400 to-amber-600",
    },
  ], [t]);

  const [planPrices, setPlanPrices] = useState<Record<string, number>>({});

  useEffect(() => {
    async function fetchPrices() {
      try {
        const entries = await Promise.all(
          plansMockData.map(async plan => {
            const apiPlan = await getSubscriptionPlanByIdorSlug(plan.id);
            return [plan.id, apiPlan.price] as [string, number];
          })
        );
        setPlanPrices(Object.fromEntries(entries));
      } catch {
        // optionally handle errors
      }
    }
    fetchPrices();

    // Generate particle properties only on the client-side after mount
    const generatedParticles = Array.from({ length: 20 }).map((_, i) => ({
      id: i,
      width: Math.random() * 10 + 5,
      height: Math.random() * 10 + 5,
      x: `${Math.random() * 100 - 50}%`,
      y: `${Math.random() * 100}%`,
      duration: Math.random() * 10 + 20,
      delay: Math.random() * 20,
    }));
    setSubscriptionParticles(generatedParticles);
  }, [plansMockData]);

  return (
    <section className="relative py-12 sm:py-16 md:py-20 lg:py-24 overflow-hidden" id="pricing">
      {/* Enhanced Background Elements with interactive particles */}
      <div className="absolute inset-0 bg-gradient-to-b from-white to-gray-50/80 z-0"></div>

      {/* Decorative circles */}
      <div className="absolute -top-40 left-20 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
      <div className="absolute top-1/3 right-5 w-72 h-72 bg-amber-500/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 left-1/4 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl"></div>

      {/* Animated particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="particles-container relative w-full h-full">
          {subscriptionParticles && subscriptionParticles.map((p) => (
            <motion.div
              key={p.id}
              className="absolute rounded-full bg-primary/20"
              style={{
                width: p.width,
                height: p.height,
                left: p.x,
                top: p.y,
              }}
              initial={{ opacity: 0 }}
              animate={{
                y: ["0%", "-100vh"],
                opacity: [0, 0.5, 0],
              }}
              transition={{
                duration: p.duration,
                repeat: Infinity,
                ease: "linear",
                delay: p.delay,
              }}
            />
          ))}
        </div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="text-center max-w-3xl mx-auto mb-10 sm:mb-16"
        >
          <span className="text-primary font-semibold tracking-wider uppercase mb-2 sm:mb-3 inline-block">
            {t("pricing")}
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 sm:mb-5 tracking-tight">
            {t("subscriptionPlans.title")}
          </h2>
          <div className="w-16 sm:w-24 h-1.5 bg-primary mx-auto rounded-full mb-4 sm:mb-6"></div>
          <p className="text-base sm:text-lg text-gray-600 leading-relaxed px-4">
            {t("subscriptionPlans.subtitle")}
          </p>
        </motion.div>

        {/* Improved flexbox layout with better large screen handling */}
        <div className="flex flex-wrap justify-center gap-8 max-w-7xl mx-auto">
          {plansMockData.map((plan, index) => (
            <motion.div
              key={plan.id || `plan-${index}`}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.7, delay: index * 0.15 }}
              className={`relative flex-grow flex-shrink-0 
                w-full 
                sm:w-[min(calc(50%-1rem),400px)] 
                lg:w-[min(calc(33.333%-1.5rem),350px)] 
                ${plan.popular ? 'order-first sm:order-none lg:-mt-6 lg:z-10' : ''}`}
            >
              <motion.div
                whileHover={{ y: -8 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
                className={`relative rounded-2xl shadow-xl overflow-hidden h-full border border-gray-100 bg-white ${plan.popular ? 'ring-2 ring-primary lg:scale-105' : ''
                  }`}
              >
                {/* Popular Badge */}
                {plan.popular && (
                  <div className="absolute -top-5 -right-5">
                    <div className="relative">
                      <div className="absolute -inset-3 bg-primary/20 rounded-full blur-xl opacity-70"></div>
                      <div className="relative bg-gradient-to-r from-primary to-primary-600 text-white text-xs font-bold px-3 sm:px-4 py-1.5 rounded-full shadow-lg whitespace-nowrap">
                        <Sparkle className="h-3.5 w-3.5 inline-block mr-1 text-yellow-200" />
                        {t("most popular")}
                      </div>
                    </div>
                  </div>
                )}

                {/* Header with gradient */}
                <div className={`${plan.headerClass} bg-green-500 text-white p-6 sm:p-8 relative overflow-hidden`}>
                  {/* Abstract shape for visual interest */}
                  <div className="absolute -right-16 -bottom-16 w-48 h-48 bg-white/10 rounded-full"></div>
                  <div className="absolute top-0 left-0 w-full h-1 bg-white/20"></div>

                  {/* Plan title and icon */}
                  <div className="flex items-start justify-between mb-4 sm:mb-6">
                    <div>
                      <h3 className="text-xl sm:text-2xl md:text-3xl font-bold mb-1">{plan.name}</h3>
                      <p className="opacity-80 font-medium text-sm sm:text-base">{plan.description}</p>
                    </div>
                    <div className="bg-white/20 rounded-full p-2 sm:p-3 backdrop-blur-sm">
                      {plan.icon}
                    </div>
                  </div>

                  {/* Price block with enhanced typography */}
                  <div className="mb-2">
                    <div className="flex items-baseline flex-wrap">
                      <span className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight">
                        {planPrices[plan.id] ?? plan.price}
                      </span>
                      <div className="ml-2">
                        <span className="text-lg sm:text-xl font-semibold">{plan.currency}</span>
                        <span className="opacity-70 text-xs sm:text-sm ml-1">{plan.period}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Features with improved visuals */}
                <div className="p-6 sm:p-8">
                  <h4 className="text-xs sm:text-sm uppercase tracking-wider text-gray-500 mb-4 font-medium">
                    {t("features.title")}
                  </h4>
                  <ul className="space-y-3 sm:space-y-4">
                    {Array.isArray(plan.features) && plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start">
                        <div className={`flex-shrink-0 mt-0.5 ${plan.highlightFeatures?.includes(featureIndex)
                            ? `text-${plan.variant === 'basic' ? 'blue' : plan.variant === 'standard' ? 'primary' : 'amber'}-500`
                            : 'text-gray-400'
                          }`}>
                          <Check className="h-4 sm:h-5 w-4 sm:w-5 mr-2 sm:mr-3" />
                        </div>
                        <span className={`text-sm sm:text-base text-gray-700 ${plan.highlightFeatures?.includes(featureIndex) ? 'font-medium' : ''
                          }`}>
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA Button */}
                  <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-gray-100">
                    <Link href={getUrl(`/subscribe/${plan.id}`)}>
                      <motion.div
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Button
                          className={`w-full ${plan.buttonClass} text-white py-4 sm:py-6 rounded-xl transition-all duration-300 font-semibold text-sm sm:text-base`}
                        >
                          {t("subscriptionPlans.choose")}
                          <ChevronRight className="h-4 w-4 ml-2 opacity-70" />
                        </Button>
                      </motion.div>
                    </Link>
                  </div>
                </div>

                {/* Best Value badge - inside the card */}
                {plan.bestValue && (
                  <div className="absolute top-3 left-0 w-full">
                    <div className="-mt-3 mx-auto w-fit bg-gradient-to-r from-amber-500 to-amber-600 text-white text-xs font-bold px-3 sm:px-4 py-1.5 rounded-full shadow-lg">
                      <Crown className="h-3.5 w-3.5 inline-block mr-1" />
                      BEST VALUE
                    </div>
                  </div>
                )}
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
