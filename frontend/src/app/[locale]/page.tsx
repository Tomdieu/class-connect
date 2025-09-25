"use client";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import { SubscriptionPlans } from "@/components/SubscriptionPlans";
import Footer from "@/components/Footer";
import { useCurrentLocale, useI18n } from "@/locales/client";
import React, { Suspense } from "react";
import { Helmet } from "react-helmet-async";
import Loading from "./loading";
import CTASection from "./components/CTASection";
import DeveloperSectionSEO from "./components/DeveloperSectionSEO";
import FeaturesSection from "./components/FeaturesSection";
import FloatingCTA from "./components/FloatingCTA";

function LandingPage() {
  const t = useI18n();
  const locale = useCurrentLocale();

  // Create enhanced localized JSON-LD data using translations and including developer info
  const jsonLdData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name:
      locale === "fr"
        ? "ClassConnect - Plateforme d'Apprentissage en Ligne"
        : "ClassConnect - Online Learning Platform",
    description: t("hero.subtitle"),
    author: {
      "@type": "Person",
      name: "Tomdieu Ivan",
      url: "https://github.com/Tomdieu",
      sameAs: [
        "https://www.linkedin.com/in/tomdieuivan/",
        "https://github.com/Tomdieu"
      ]
    },
    creator: {
      "@type": "Person",
      name: "Tomdieu Ivan",
      jobTitle: "Full Stack Developer",
      url: "https://github.com/Tomdieu",
      sameAs: [
        "https://www.linkedin.com/in/tomdieuivan/",
        "https://github.com/Tomdieu"
      ]
    },
    offers: {
      "@type": "AggregateOffer",
      offers: [
        {
          "@type": "Offer",
          name: t("subscriptionPlans.basic.name"),
          description: t("subscriptionPlans.basic.description"),
          availableLanguage: [locale === "fr" ? "French" : "English"],
        },
        {
          "@type": "Offer",
          name: t("subscriptionPlans.standard.name"),
          description: t("subscriptionPlans.standard.description"),
          availableLanguage: [locale === "fr" ? "French" : "English"],
        },
        {
          "@type": "Offer",
          name: t("subscriptionPlans.premium.name"),
          description: t("subscriptionPlans.premium.description"),
          availableLanguage: [locale === "fr" ? "French" : "English"],
        },
      ],
    },
    inLanguage: locale === "fr" ? "fr" : "en",
    mainEntity: {
      "@type": "SoftwareApplication",
      name: "ClassConnect",
      applicationCategory: "EducationalApplication",
      operatingSystem: "Web",
      author: {
        "@type": "Person",
        name: "Tomdieu Ivan"
      }
    }
  };

  // Create localized meta tags with enhanced SEO for developer name
  const pageTitle =
    locale === "fr"
      ? "ClassConnect | Plateforme E-learning N°1 au Cameroun | Développée par Tomdieu Ivan"
      : "ClassConnect | #1 E-learning Platform in Cameroon | Developed by Tomdieu Ivan";

  const pageDescription =
    locale === "fr"
      ? "Découvrez ClassConnect, la plateforme d'e-learning innovante au Cameroun développée par Tomdieu Ivan. Apprenez à votre rythme avec des cours personnalisés."
      : "Discover ClassConnect, the innovative e-learning platform in Cameroon developed by Tomdieu Ivan. Learn at your own pace with personalized courses.";

  // Enhanced keywords for better SEO including developer name and more search terms
  const keywords =
    "e-learning, éducation en ligne, cours en ligne, Cameroun, apprentissage en ligne, plateforme éducative, cours personnalisés, enseignement à distance, école virtuelle, lycée en ligne, université en ligne, tutorat, développement professionnel, compétences numériques, enseignement interactif, formation continue, soutien scolaire, préparation aux examens, apprentissage mobile, éducation en Afrique, plateforme éducative Cameroun, cours en ligne certifiés, apprentissage numérique Afrique, Tomdieu Ivan, développeur Tomdieu Ivan, ClassConnect Tomdieu, Ivan Tomdieu, Cameroun développeur, " +
    "e-learning, online education, online courses, Cameroon, online learning, educational platform, personalized courses, distance learning, virtual school, online high school, online university, tutoring, professional development, digital skills, interactive teaching, continuing education, academic support, exam preparation, mobile learning, education in Africa, online learning Cameroon, virtual classroom Africa, Cameroon education technology, Tomdieu Ivan, developer Tomdieu Ivan, ClassConnect Tomdieu, Ivan Tomdieu, Cameroon developer, " +
    // Add more specific and broader keywords
    "cours de mathématiques en ligne, cours de physique en ligne, cours de chimie en ligne, cours de biologie en ligne, cours de français en ligne, cours d'anglais en ligne, cours d'informatique en ligne, programmation web, développement web Cameroun, " +
    "formation professionnelle Cameroun, certification en ligne, MOOC Cameroun, SPOC Cameroun, éducation numérique Cameroun, technologie éducative, EdTech Cameroun, " +
    "soutien scolaire primaire, soutien scolaire collège, soutien scolaire lycée, préparation baccalauréat Cameroun, préparation GCE Cameroon, " +
    "apprentissage adaptatif, microlearning, gamification éducation, classe virtuelle interactive, plateforme LMS Cameroun, " +
    "meilleure plateforme e-learning Cameroun, cours en ligne abordables, éducation de qualité Cameroun, transformation digitale éducation, " +
    "online math courses, online physics courses, online chemistry courses, online biology courses, online French courses, online English courses, online computer science courses, web programming, web development Cameroon, " +
    "vocational training Cameroon, online certification, MOOC Cameroon, SPOC Cameroon, digital education Cameroon, educational technology, EdTech Cameroon, " +
    "primary school tutoring, middle school tutoring, high school tutoring, baccalaureate preparation Cameroon, GCE preparation Cameroon, " +
    "adaptive learning, microlearning, education gamification, interactive virtual classroom, LMS platform Cameroon, " +
    "best e-learning platform Cameroon, affordable online courses, quality education Cameroon, digital transformation education, " +
    "remote learning solutions, homeschooling support, adult learning online, career change courses, upskilling platform, lifelong learning opportunities, digital literacy Cameroon, tech skills training";


  const additionalMetaTags = [
    { name: "robots", content: "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" },
    { name: "theme-color", content: "#ffffff" },
    { name: "msapplication-TileColor", content: "#ffffff" },
    { name: "google-site-verification", content: "google1a036d19159746c1" },
    // { name: "fb:app_id", content: "your-fb-app-id" },
    { name: "og:site_name", content: "ClassConnect" },
    { name: "og:image", content: "https://www.classconnect.cm/og-image.jpg" },
    { name: "og:image:width", content: "1200" },
    { name: "og:image:height", content: "630" },
    { name: "twitter:image", content: "https://www.classconnect.cm/twitter-image.jpg" },
  ];

  return (
    <div className="relative flex-1 w-full h-full flex flex-col">
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <meta name="keywords" content={keywords} />
        <link rel="canonical" href={`https://www.classconnect.cm/${locale}`} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:url" content={`https://www.classconnect.cm/${locale}`} />
        <meta property="og:type" content="website" />
        <meta property="og:locale" content={locale === "fr" ? "fr_FR" : "en_US"} />
        <meta property="og:image" content="https://www.classconnect.cm/og-image.jpg" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDescription} />
        <meta name="twitter:image" content="https://www.classconnect.cm/twitter-image.jpg" />
        <meta name="author" content="Tomdieu Ivan" />

        {/* Additional meta tags for developer attribution */}
        <meta name="developer" content="Tomdieu Ivan" />
        <meta name="creator" content="Tomdieu Ivan" />
        <meta name="copyright" content="ClassConnect - Tomdieu Ivan" />
        <meta name="application-developer" content="Tomdieu Ivan" />
        <meta name="owner" content="Tomdieu Ivan" />
        {/* New additional SEO meta tags */}
        {additionalMetaTags.map((tag, index) => (
          <meta key={index} name={tag.name} content={tag.content} />
        ))}
        <script type="application/ld+json">{JSON.stringify(jsonLdData)}</script>
      </Helmet>

      <Header className="fixed top-0 left-0 right-0 shadow-md bg-white/95 backdrop-blur-md border-b border-gray-100 px-5 z-[99999999]" />

      {/* Add a spacer to push content below the fixed header */}
      <div className="h-20 mt-10 md:mt-0 md:h-20"></div>

      <main className="flex-1">
        {/* Hero Section - Full Screen */}
        <Suspense fallback={<Loading />}>
          <section className="min-h-screen flex items-center justify-center relative">
            <Hero className="w-full" />
          </section>
        </Suspense>

        {/* Features Section - Full Screen */}
        <section className="min-h-screen flex items-center justify-center relative">
          <FeaturesSection className="w-full" />
        </section>

        {/* Subscription Plans Section - Full Screen */}
        <section className="min-h-screen flex items-center justify-center relative">
          <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-blue-50 w-full">
              <div className="container mx-auto px-4 animate-pulse">
                <div className="text-center mb-16">
                  <div className="h-10 bg-gray-200 rounded w-64 mx-auto mb-4"></div>
                  <div className="h-6 bg-gray-200 rounded w-96 mx-auto"></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="bg-white rounded-2xl p-8 shadow-md">
                      <div className="h-8 bg-gray-200 rounded w-32 mb-4"></div>
                      <div className="h-12 bg-gray-200 rounded w-40 mb-6"></div>
                      <div className="space-y-3 mb-8">
                        {[1, 2, 3, 4].map(j => (
                          <div key={j} className="h-5 bg-gray-200 rounded w-full"></div>
                        ))}
                      </div>
                      <div className="h-12 bg-gray-200 rounded w-full"></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          }>
            <SubscriptionPlans />
          </Suspense>
        </section>

        {/* Developer Section - Full Screen */}
        <section className="min-h-screen flex items-center justify-center relative">
          <DeveloperSectionSEO />
        </section>

        {/* CTA Section - Full Screen */}
        <section className="min-h-screen flex items-center justify-center relative">
          <CTASection className="w-full" />
        </section>
      </main>

      <Footer />
      <FloatingCTA />
    </div>
  );
}

export default LandingPage;
