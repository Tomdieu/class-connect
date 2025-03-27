"use client";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import { SubscriptionPlans } from "@/components/SubscriptionPlans";
import Footer from "@/components/Footer";
import { LottieWrapper } from "@/components/ui/lottie-wrapper";
import { RevealOnScroll } from "@/components/ui/reveal-on-scroll";
import { useCurrentLocale, useI18n } from "@/locales/client";
import React from "react";
import { Helmet } from 'react-helmet-async';

// Import your animations
import studentAnimation from "@/animations/student-learning.json";
import teachingAnimation from "@/animations/teaching.json";
import learningAnimation from "@/animations/learning-process.json";

function LandingPage() {
  const t = useI18n();
  const locale = useCurrentLocale();

  console.log({locale})
  
  // Create localized JSON-LD data using translations
  const jsonLdData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": locale === 'fr' ? "ClassConnect - Plateforme d'Apprentissage en Ligne" : "ClassConnect - Online Learning Platform",
    "description": t("hero.subtitle"),
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
          "name": t("subscriptionPlans.basic.name"),
          "description": t("subscriptionPlans.basic.description"),
          "availableLanguage": [
            locale === 'fr' ? "French" : "English"
          ]
        },
        {
          "@type": "Offer",
          "name": t("subscriptionPlans.standard.name"),
          "description": t("subscriptionPlans.standard.description"),
          "availableLanguage": [
            locale === 'fr' ? "French" : "English"
          ]
        },
        {
          "@type": "Offer",
          "name": t("subscriptionPlans.premium.name"),
          "description": t("subscriptionPlans.premium.description"),
          "availableLanguage": [
            locale === 'fr' ? "French" : "English"
          ]
        }
      ]
    },
    "inLanguage": locale === 'fr' ? "fr" : "en"
  };

  // Create localized meta tags
  const pageTitle = locale === 'fr' 
    ? "ClassConnect | Plateforme E-learning N°1 au Cameroun"
    : "ClassConnect | #1 E-learning Platform in Cameroon";
    
  const pageDescription = locale === 'fr'
    ? "Découvrez ClassConnect, la plateforme d'e-learning innovante au Cameroun. Apprenez à votre rythme avec des cours personnalisés."
    : "Discover ClassConnect, the innovative e-learning platform in Cameroon. Learn at your own pace with personalized courses.";

  // Enhanced keywords for better SEO
  const keywords = locale === 'fr'
    ? "e-learning, éducation en ligne, cours en ligne, Cameroun, apprentissage en ligne, plateforme éducative, cours personnalisés, enseignement à distance, école virtuelle, lycée en ligne, université en ligne, tutorat, développement professionnel, compétences numériques, enseignement interactif, formation continue, soutien scolaire, préparation aux examens, apprentissage mobile, éducation en Afrique"
    : "e-learning, online education, online courses, Cameroon, online learning, educational platform, personalized courses, distance learning, virtual school, online high school, online university, tutoring, professional development, digital skills, interactive teaching, continuing education, academic support, exam preparation, mobile learning, education in Africa";

  return (
    <div className="relative flex-1 w-full h-full flex flex-col min-h-screen">
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <meta name="keywords" content={keywords} />
        <link rel="canonical" href={`https://www.classconnect.cm/${locale}`} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:url" content={`https://www.classconnect.cm/${locale}`} />
        <meta property="og:type" content="website" />
        <meta property="og:locale" content={locale === 'fr' ? "fr_FR" : "en_US"} />
        {/* Additional meta tags for improved SEO */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDescription} />
        <meta name="geo.region" content="CM" />
        <meta name="geo.placename" content="Cameroon" />
        <meta name="author" content="ClassConnect" />
        <script type="application/ld+json">{JSON.stringify(jsonLdData)}</script>
      </Helmet>
      
      <Header className="bg-white/80 backdrop-blur-sm border-b border-gray-100 px-5 sticky top-0 z-50" />
      <main className="flex-1">
      <Hero />
        
        {/* Animated Features Section */}
        <section className="py-24 bg-gradient-to-b from-white to-blue-50">
          <div className="container mx-auto px-4">
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

          <SubscriptionPlans />
      </main>
      <Footer />
    </div>
  );
}

export default LandingPage;
