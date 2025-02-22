"use client";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import { SubscriptionPlans } from "@/components/SubscriptionPlans";
import Footer from "@/components/Footer";
import { LottieWrapper } from "@/components/ui/lottie-wrapper";
import { RevealOnScroll } from "@/components/ui/reveal-on-scroll";
import { useI18n } from "@/locales/client";
import React from "react";
import { Helmet } from 'react-helmet-async';

// Import your animations
import studentAnimation from "@/animations/student-learning.json";
import teachingAnimation from "@/animations/teaching.json";
import learningAnimation from "@/animations/learning-process.json";

function LandingPage() {
  const t = useI18n();

  const jsonLdData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "ClassConnect - Online Learning Platform",
    "description": "Learn at your own pace with quality courses and personalized monitoring",
    "provider": {
      "@type": "Organization",
      "name": "ClassConnect",
      "sameAs": ["https://www.classconnect.cm"]
    },
    "offers": {
      "@type": "AggregateOffer",
      "offers": [
        {
          "@type": "Offer",
          "name": "Basic Plan",
          "description": "Access to basic courses and community forum"
        },
        {
          "@type": "Offer",
          "name": "Standard Plan",
          "description": "Access to more courses and weekly Q&A sessions"
        },
        {
          "@type": "Offer",
          "name": "Premium Plan",
          "description": "Full access to all features and priority support"
        }
      ]
    }
  };

  return (
    <div className="relative flex-1 w-full h-full flex flex-col min-h-screen">
      <Helmet>
        <title>ClassConnect | Plateforme E-learning N°1 au Cameroun</title>
        <meta name="description" content="Découvrez ClassConnect, la plateforme d'e-learning innovante au Cameroun. Apprenez à votre rythme avec des cours personnalisés." />
        <meta name="keywords" content="e-learning, education en ligne, cours en ligne, Cameroun, apprentissage en ligne" />
        <link rel="canonical" href="https://www.classconnect.cm" />
        <meta property="og:title" content="ClassConnect | Plateforme E-learning N°1 au Cameroun" />
        <meta property="og:description" content="Découvrez ClassConnect, la plateforme d'e-learning innovante au Cameroun." />
        <meta property="og:url" content="https://www.classconnect.cm" />
        <meta property="og:type" content="website" />
        <script type="application/ld+json">{JSON.stringify(jsonLdData)}</script>
      </Helmet>
      <Header className="bg-white/80 backdrop-blur-sm border-b border-gray-100 px-5 sticky top-0 z-50" />
      <main className="flex-1">
        <RevealOnScroll>
          <Hero />
        </RevealOnScroll>
        
        {/* Animated Features Section */}
        <section className="py-24 bg-gradient-to-b from-white to-blue-50">
          <div className="container mx-auto px-4"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              {/* Feature 1 */}
              <RevealOnScroll direction="up" delay={0.2}>
                <div className="flex flex-col items-center">
                  <div className="relative w-64 h-64 mb-6">
                    <LottieWrapper 
                      animation={studentAnimation}
                      className="pointer-events-none select-none"
                    />
                  </div>
                  <div className="text-center mt-2">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {t("animatedFeatures.selfPaced.title")}
                    </h3>
                    <p className="text-gray-600">
                      {t("animatedFeatures.selfPaced.description")}
                    </p>
                  </div>
                </div>
              </RevealOnScroll>

              {/* Feature 2 */}
              <RevealOnScroll direction="up" delay={0.4}>
                <div className="flex flex-col items-center">
                  <div className="relative w-64 h-64 mb-6">
                    <LottieWrapper 
                      animation={teachingAnimation}
                      className="pointer-events-none select-none"
                    />
                  </div>
                  <div className="text-center mt-2">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {t("animatedFeatures.experts.title")}
                    </h3>
                    <p className="text-gray-600">
                      {t("animatedFeatures.experts.description")}
                    </p>
                  </div>
                </div>
              </RevealOnScroll>

              {/* Feature 3 */}
              <RevealOnScroll direction="up" delay={0.6}>
                <div className="flex flex-col items-center">
                  <div className="relative w-64 h-64 mb-6">
                    <LottieWrapper 
                      animation={learningAnimation}
                      className="pointer-events-none select-none"
                    />
                  </div>
                  <div className="text-center mt-2">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {t("animatedFeatures.interactive.title")}
                    </h3>
                    <p className="text-gray-600">
                      {t("animatedFeatures.interactive.description")}
                    </p>
                  </div>
                </div>
              </RevealOnScroll>
            </div>
          </div>
        </section>

        <RevealOnScroll direction="up">
          <SubscriptionPlans />
        </RevealOnScroll>
      </main>
      <Footer />
    </div>
  );
}

export default LandingPage;
