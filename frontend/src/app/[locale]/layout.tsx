import type { Metadata } from "next";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import Modals from "@/components/modals";
import { Providers } from "./providers";

import localFont from "next/font/local";
import { SessionProvider } from "next-auth/react";
import ReactQueryProvider from "@/providers/ReactQueryProvider";
import React, { ReactElement } from "react";
import InactivityProvider from "@/providers/InactivityProvider";
import HelmetWrapper from "@/providers/HelmetWrapperProvider";
import GoogleAnalytics from "@/components/GoogleAnalytics";

// Optimize font loading
const Inter = localFont({
  src: [
    {
      path: "../../../public/fonts/Inter/static/Inter-Regular.ttf",
      weight: "400",
    },
    {
      path: "../../../public/fonts/Inter/static/Inter-Medium.ttf",
      weight: "500",
    },
    {
      path: "../../../public/fonts/Inter/static/Inter-SemiBold.ttf",
      weight: "600",
    },
    {
      path: "../../../public/fonts/Inter/static/Inter-Bold.ttf",
      weight: "700",
    },
    {
      path: "../../../public/fonts/Inter/static/Inter-Black.ttf",
      weight: "800",
    },
    {
      path: "../../../public/fonts/Inter/static/Inter-ExtraBold.ttf",
      weight: "900",
    },
  ],
  variable: "--font-inter",
  display: "optional", // Changed from "swap" to "optional"
  preload: true,
});

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;

  // Base URL for all environments
  const baseUrl = "https://www.classconnect.cm";

  // Create metadata objects for each language
  const metadata: Record<string, Metadata> = {
    fr: {
      title: "ClassConnect | Plateforme E-learning N°1 au Cameroun",
      description:
        "ClassConnect est la première plateforme d'apprentissage en ligne au Cameroun offrant des cours personnalisés et un apprentissage adapté à votre rythme.",
      keywords: [
        "ClassConnect",
        "e learning Cameroun",
        "e-learning Cameroon",
        "Tomdieu Ivan",
        "plateforme éducative Cameroun",
        "cours en ligne Cameroun",
        "education Cameroun",
        "apprentissage en ligne",
        "formation en ligne Cameroun",
        "meilleure plateforme e-learning Cameroun",
        "ClassConnect Cameroun",
        "education numérique Afrique",
      ].join(", "),
      openGraph: {
        type: "website",
        locale: "fr_FR",
        url: `${baseUrl}/fr`,
        title: "ClassConnect | Meilleure Plateforme E-learning au Cameroun",
        description:
          "Découvrez ClassConnect, la plateforme d'e-learning innovante au Cameroun. Apprenez à votre rythme avec des cours personnalisés et une expérience d'apprentissage unique.",
        images: [
          {
            url: `${baseUrl}/og-image-fr.jpg`,
            width: 1200,
            height: 630,
            alt: "ClassConnect - Plateforme E-learning Cameroun",
          },
        ],
        siteName: "ClassConnect",
      },
      twitter: {
        card: "summary_large_image",
        title: "ClassConnect | E-learning Cameroun",
        description:
          "La meilleure plateforme d'apprentissage en ligne au Cameroun. Une éducation accessible à tous.",
        site: "@classconnect",
        creator: "@tomdieuivan",
        images: [
          {
            url: `${baseUrl}/twitter-card-fr.jpg`,
            width: 1200,
            height: 630,
            alt: "ClassConnect - E-learning Cameroun",
          },
        ],
      },
    },
    en: {
      title: "ClassConnect | #1 E-learning Platform in Cameroon",
      description:
        "ClassConnect is the first online learning platform in Cameroon offering personalized courses and learning adapted to your pace.",
      keywords: [
        "ClassConnect",
        "e learning Cameroon",
        "e-learning Cameroon",
        "Tomdieu Ivan",
        "educational platform Cameroon",
        "online courses Cameroon",
        "education Cameroon",
        "online learning",
        "online training Cameroon",
        "best e-learning platform Cameroon",
        "ClassConnect Cameroon",
        "digital education Africa",
      ].join(", "),
      openGraph: {
        type: "website",
        locale: "en_US",
        url: `${baseUrl}/en`,
        title: "ClassConnect | Best E-learning Platform in Cameroon",
        description:
          "Discover ClassConnect, the innovative e-learning platform in Cameroon. Learn at your own pace with personalized courses and a unique learning experience.",
        images: [
          {
            url: `${baseUrl}/og-image-en.jpg`,
            width: 1200,
            height: 630,
            alt: "ClassConnect - E-learning Platform Cameroon",
          },
        ],
        siteName: "ClassConnect",
      },
      twitter: {
        card: "summary_large_image",
        title: "ClassConnect | E-learning Cameroon",
        description:
          "The best online learning platform in Cameroon. Education accessible to everyone.",
        site: "@classconnect",
        creator: "@tomdieuivan",
        images: [
          {
            url: `${baseUrl}/twitter-card-en.jpg`,
            width: 1200,
            height: 630,
            alt: "ClassConnect - E-learning Cameroon",
          },
        ],
      },
    },
  };

  // Common metadata properties for both languages
  return {
    ...(metadata[locale] || metadata["fr"]), // Default to French if locale not found
    authors: [
      {
        name: "Tomdieu Ivan",
        url: "https://www.linkedin.com/in/tomdieuivan",
      },
    ],
    creator: "Tomdieu Ivan",
    publisher: "ClassConnect",
    robots: {
      index: true,
      follow: true,
      nocache: true,
      googleBot: {
        index: true,
        follow: true,
        noimageindex: false,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    metadataBase: new URL(baseUrl),
    category: "Education",
    classification: "E-learning Platform",
    verification: {
      google: "google1a036d19159746c1.html",
    },
    alternates: {
      languages: {
        fr: "/fr",
        en: "/en",
      },
      // canonical: `/${locale}`,
    },
    icons: {
      icon: [
        { url: "/favicon.ico", sizes: "any" },
        { url: "/icon.png", type: "image/png", sizes: "32x32" },
      ],
      apple: [{ url: "/apple-icon.png", sizes: "180x180", type: "image/png" }],
    },
    appleWebApp: {
      capable: true,
      statusBarStyle: "default",
      title: "ClassConnect",
    },
  };
}

export default async function RootLayout({
  params,
  children,
}: {
  params: Promise<{ locale: string }>;
  children: ReactElement;
}) {
  const { locale } = await params;

  // Locale-specific structured data
  const jsonLdData = {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    name: "ClassConnect",
    url: "https://www.classconnect.cm",
    logo: "https://www.classconnect.cm/logo.png",
    sameAs: [
      "https://www.linkedin.com/in/tomdieuivan",
      "https://twitter.com/classconnect",
    ],
    description:
      locale === "en"
        ? "ClassConnect is the first online learning platform in Cameroon offering personalized courses and learning adapted to your pace."
        : "ClassConnect est la première plateforme d'apprentissage en ligne au Cameroun offrant des cours personnalisés et un apprentissage adapté à votre rythme.",
    address: {
      "@type": "PostalAddress",
      addressCountry: "CM",
      addressRegion: "Littoral", // Add if applicable
      addressLocality: "Douala", // Add if applicable
    },
    foundingDate: "2025", // Add actual founding date
    founder: {
      "@type": "Person",
      name: "Tomdieu Ivan",
      sameAs: "https://www.linkedin.com/in/tomdieuivan",
    },
    areaServed: {
      "@type": "Country",
      name: "Cameroon",
    },
    teaches: [
      "High School Education",
      "Middle School Education",
      "University Level Education",
      "Professional Development",
    ],
    educationalLevel: [
      "Middle School",
      "High School",
      "University",
      "Professional Development",
    ],
    availableLanguage: ["French", "English"],
    offers: {
      "@type": "Offer",
      category: "Online Education",
      availabilityStarts: new Date().toString(), // Add actual date
      educationalProgramMode: "online",
      educationalUse: "Online Learning Platform",
    },
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer support",
      availableLanguage: ["French", "English"],
      email: "contact@classconnect.cm", // Add actual contact email
    },
  };

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.webmanifest" />
        <link rel="shortcut icon" href="/favicon.ico" />
        <meta name="theme-color" content="#2563eb" />
        <link
          rel="preconnect"
          href="https://www.classconnect.cm"
          crossOrigin="anonymous"
        />
        {/* Add preload for critical assets */}
        <link rel="preload" as="image" href="/logo.png" />
        {/* Add hreflang tags */}
        <link
          rel="alternate"
          hrefLang="fr"
          href="https://www.classconnect.cm/fr"
        />
        <link
          rel="alternate"
          hrefLang="en-US"
          href="https://www.classconnect.cm/en"
        />
        <link rel="canonical" href={`https://www.classconnect.cm/${locale}`} />
        <link
          rel="alternate"
          hrefLang="x-default"
          href="https://www.classconnect.cm"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdData) }}
        />
        {/* <GoogleAnalytics measurementId="G-H8NMLWT2HV" /> */}
      </head>
      <body
        className={`antialiased overflow-y-auto flex flex-col ${Inter.variable} font-inter h-screen w-full`}
        suppressHydrationWarning
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          disableTransitionOnChange
        >
          <SessionProvider>
            <ReactQueryProvider>
              <Providers locale={locale}>
                <HelmetWrapper>
                  <InactivityProvider>{children}</InactivityProvider>
                  <Modals />
                  <Toaster />
                </HelmetWrapper>
              </Providers>
            </ReactQueryProvider>
          </SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
