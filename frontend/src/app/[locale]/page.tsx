import Header from "@/components/Header";
import Hero from "@/components/Hero";
import { SubscriptionPlans } from "@/components/SubscriptionPlans";
import Footer from "@/components/Footer";
import React, { Suspense } from "react";
import Loading from "./loading";
import CTASection from "./components/CTASection";
import FeaturesSection from "./components/FeaturesSection";
import FloatingCTA from "./components/FloatingCTA";
import FAQSection from "./components/FAQSection";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const baseUrl = "https://www.classconnect.cm";

  // Optimized keywords - focused on most relevant terms
  const keywords = locale === "fr"
    ? "e-learning Cameroun, ClassConnect, cours en ligne Cameroun, plateforme éducative Cameroun, apprentissage en ligne, formation en ligne, éducation numérique Cameroun, EdTech Cameroun, cours personnalisés, enseignement à distance"
    : "e-learning Cameroon, ClassConnect, online courses Cameroon, educational platform Cameroon, online learning, digital education Cameroon, EdTech Cameroon, personalized courses, distance learning";

  const pageTitle = locale === "fr"
    ? "ClassConnect | Plateforme E-learning N°1 au Cameroun"
    : "ClassConnect | #1 E-learning Platform in Cameroon";

  const pageDescription = locale === "fr"
    ? "Découvrez ClassConnect, la plateforme d'e-learning innovante au Cameroun. Apprenez à votre rythme avec des cours personnalisés, des enseignants qualifiés et une communauté active."
    : "Discover ClassConnect, the innovative e-learning platform in Cameroon. Learn at your own pace with personalized courses, qualified teachers and an active community.";

  // Enhanced structured data
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    name: "ClassConnect",
    alternateName: "ClassConnect E-learning Platform",
    url: baseUrl,
    description: pageDescription,
    logo: {
      "@type": "ImageObject",
      url: `${baseUrl}/logo.png`,
      width: "180",
      height: "180"
    },
    sameAs: [
      "https://www.linkedin.com/in/tomdieuivan",
      "https://github.com/Tomdieu",
    ],
    address: {
      "@type": "PostalAddress",
      addressCountry: "CM",
      addressRegion: "Littoral",
      addressLocality: "Douala",
    },
    areaServed: {
      "@type": "Country",
      name: "Cameroon"
    },
    founder: {
      "@type": "Person",
      name: "Tomdieu Ivan",
      jobTitle: "Full Stack Developer",
      url: "https://github.com/Tomdieu",
      sameAs: [
        "https://www.linkedin.com/in/tomdieuivan",
        "https://github.com/Tomdieu"
      ]
    },
    availableLanguage: ["French", "English"],
    educationalLevel: ["Middle School", "High School", "University", "Professional Development"],
    teaches: ["High School Education", "Computer Science", "Mathematics", "Physics"],
  };

  return {
    title: pageTitle,
    description: pageDescription,
    keywords,
    authors: [
      {
        name: "Tomdieu Ivan",
        url: "https://www.linkedin.com/in/tomdieuivan",
      },
    ],
    creator: "Tomdieu Ivan",
    publisher: "ClassConnect",
    openGraph: {
      type: "website",
      locale: locale === "fr" ? "fr_FR" : "en_US",
      url: `${baseUrl}/${locale}`,
      title: pageTitle,
      description: pageDescription,
      images: [
        {
          url: `${baseUrl}/og-image.jpg`,
          width: 1200,
          height: 630,
          alt: "ClassConnect E-learning Platform",
        },
      ],
      siteName: "ClassConnect",
    },
    twitter: {
      card: "summary_large_image",
      title: pageTitle,
      description: pageDescription,
      images: [`${baseUrl}/twitter-image.jpg`],
      creator: "@tomdieuivan",
      site: "@classconnect",
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    alternates: {
      canonical: `${baseUrl}/${locale}`,
      languages: {
        fr: `${baseUrl}/fr`,
        en: `${baseUrl}/en`,
      },
    },
    other: {
      "application-name": "ClassConnect",
      "structured-data": JSON.stringify(structuredData),
    },
  };
}

export default async function LandingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  // Page-specific structured data for rich snippets
  const pageSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: locale === "fr"
      ? "ClassConnect - Plateforme d'Apprentissage en Ligne"
      : "ClassConnect - Online Learning Platform",
    description: locale === "fr"
      ? "La meilleure plateforme d'e-learning au Cameroun"
      : "The best e-learning platform in Cameroon",
    url: `https://www.classconnect.cm/${locale}`,
    inLanguage: locale === "fr" ? "fr" : "en",
    isPartOf: {
      "@type": "WebSite",
      url: "https://www.classconnect.cm",
      name: "ClassConnect",
    },
    breadcrumb: {
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Home",
          item: `https://www.classconnect.cm/${locale}`,
        },
      ],
    },
  };

  return (
    <div className="relative flex-1 w-full h-full flex flex-col">
      {/* Inject structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(pageSchema) }}
      />

      <Header className="fixed top-0 left-0 right-0 shadow-md bg-white/95 backdrop-blur-md border-b border-gray-100 px-5 z-[99999999]" />

      {/* Add a spacer to push content below the fixed header */}
      <div className="h-20 mt-10 md:mt-0 md:h-20"></div>

      <main className="flex-1">
        {/* Hero Section with semantic heading */}
        <Suspense fallback={<Loading />}>
          <section
            className="hero-section section-animate min-h-screen flex items-center justify-center relative full-section"
            aria-label={locale === "fr" ? "Section principale" : "Main section"}
          >
            <div className="hero-bg absolute inset-0 bg-gradient-to-b from-blue-50 to-white"></div>
            {/* Add semantic H1 for SEO */}
            <div className="w-full relative z-10">
              <h1 className="sr-only">
                {locale === "fr"
                  ? "ClassConnect - Plateforme E-learning N°1 au Cameroun"
                  : "ClassConnect - #1 E-learning Platform in Cameroon"}
              </h1>
              <Hero className="w-full" />
            </div>
          </section>
        </Suspense>

        {/* Features Section with semantic heading */}
        <section
          className="features-section section-animate min-h-screen flex items-center justify-center relative full-section"
          aria-label={locale === "fr" ? "Nos fonctionnalités" : "Our features"}
        >
          <div className="w-full">
            <h2 className="sr-only">
              {locale === "fr"
                ? "Pourquoi choisir ClassConnect"
                : "Why choose ClassConnect"}
            </h2>
            <FeaturesSection className="w-full" />
          </div>
        </section>

        {/* Subscription Plans Section with semantic heading */}
        <section
          className="subscription-section section-animate min-h-screen flex items-center justify-center relative full-section"
          aria-label={locale === "fr" ? "Nos offres" : "Our plans"}
        >
          <h2 className="sr-only">
            {locale === "fr" ? "Plans d'abonnement" : "Subscription plans"}
          </h2>
          <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-blue-50 w-full">
              <div className="container mx-auto px-4 animate-pulse">
                <div className="text-center mb-16">
                  <div className="h-10 bg-gray-200 rounded w-64 mx-auto mb-4"></div>
                  <div className="h-6 bg-gray-200 rounded w-96 mx-auto"></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="bg-white rounded-2xl p-8 shadow-md subscription-card">
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

        {/* FAQ Section with semantic heading and schema markup */}
        <FAQSection locale={locale} />

        {/* CTA Section with semantic heading */}
        <section
          className="cta-section section-animate min-h-screen flex items-center justify-center relative full-section"
          aria-label={locale === "fr" ? "Commencez maintenant" : "Get started"}
        >
          <div className="cta-content w-full">
            <h2 className="sr-only">
              {locale === "fr"
                ? "Commencez votre apprentissage aujourd'hui"
                : "Start your learning journey today"}
            </h2>
            <CTASection className="w-full" />
          </div>
        </section>
      </main>

      <Footer />
      <FloatingCTA />
    </div>
  );
}
