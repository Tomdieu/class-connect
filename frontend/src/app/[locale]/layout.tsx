import type { Metadata } from "next";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import Modals from "@/components/modals";
import { Providers } from "./providers";

import localFont from "next/font/local";
import { SessionProvider } from "next-auth/react";
import ReactQueryProvider from "@/providers/ReactQueryProvider";
import React from "react";
import InactivityProvider from "@/providers/InactivityProvider";
import HelmetWrapper from "@/providers/HelmetWrapperProvider";

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
  display: "swap",
});

export const metadata: Metadata = {
  title: "ClassConnect | Plateforme E-learning N°1 au Cameroun",
  description: "ClassConnect est la première plateforme d'apprentissage en ligne au Cameroun offrant des cours personnalisés et un apprentissage adapté à votre rythme.",
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
    "education numérique Afrique"
  ].join(", "),
  authors: [
    {
      name: "Tomdieu Ivan",
      url: "https://www.linkedin.com/in/tomdieuivan", // Add your actual LinkedIn URL
    }
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
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: "https://www.classconnect.cm",
    title: "ClassConnect | Meilleure Plateforme E-learning au Cameroun",
    description: "Découvrez ClassConnect, la plateforme d'e-learning innovante au Cameroun. Apprenez à votre rythme avec des cours personnalisés et une expérience d'apprentissage unique.",
    images: [
      {
        url: "https://www.classconnect.cm/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "ClassConnect - Plateforme E-learning Cameroun",
      },
    ],
    siteName: "ClassConnect",
    alternateLocale: ["en", "fr"],
    countryName: "Cameroon",
  },
  twitter: {
    card: "summary_large_image",
    title: "ClassConnect | E-learning Cameroun",
    description: "La meilleure plateforme d'apprentissage en ligne au Cameroun. Une éducation accessible à tous.",
    site: "@classconnect",
    creator: "@tomdieuivan",
    images: [
      {
        url: "https://www.classconnect.cm/twitter-card.jpg",
        width: 1200,
        height: 630,
        alt: "ClassConnect - E-learning Cameroun",
      },
    ],
  },
  metadataBase: new URL("https://www.classconnect.cm"),
  category: "Education",
  classification: "E-learning Platform",
  verification: {
    google: "google1a036d19159746c1.html",
  },
  alternates: {
    canonical: "https://www.classconnect.cm",
    languages: {
      'fr-CM': 'https://www.classconnect.cm/fr',
      'en-CM': 'https://www.classconnect.cm/en',
    },
  }
};

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: {
    locale: string;
  };
}) {
  const { locale } = await params;
  const jsonLdData = {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    "name": "ClassConnect",
    "url": "https://www.classconnect.cm",
    "logo": "https://www.classconnect.cm/logo.png",
    "sameAs": [
      "https://www.linkedin.com/in/tomdieuivan",
      "https://twitter.com/classconnect",
      // Add other social media profiles if available
    ],
    "description": "ClassConnect est la première plateforme d'apprentissage en ligne au Cameroun offrant des cours personnalisés et un apprentissage adapté à votre rythme.",
    "address": {
      "@type": "PostalAddress",
      "addressCountry": "CM",
      "addressRegion": "Littoral", // Add if applicable
      "addressLocality": "Douala", // Add if applicable
    },
    "foundingDate": "2025", // Add actual founding date
    "founder": {
      "@type": "Person",
      "name": "Tomdieu Ivan",
      "sameAs": "https://www.linkedin.com/in/tomdieuivan"
    },
    "areaServed": {
      "@type": "Country",
      "name": "Cameroon"
    },
    "teaches": [
      "High School Education",
      "Middle School Education",
      "University Level Education",
      "Professional Development"
    ],
    "educationalLevel": [
      "Middle School",
      "High School",
      "University",
      "Professional Development"
    ],
    "availableLanguage": [
      "French",
      "English"
    ],
    "offers": {
      "@type": "Offer",
      "category": "Online Education",
      "availabilityStarts": new Date().toString(), // Add actual date
      "educationalProgramMode": "online",
      "educationalUse": "Online Learning Platform"
    },
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "customer support",
      "availableLanguage": ["French", "English"],
      "email": "contact@classconnect.cm" // Add actual contact email
    }
  };
  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdData) }} />
      </head>
      <body
        className={`antialiased overflow-y-auto flex flex-col ${Inter.variable} font-inter`}
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
                <InactivityProvider>
                  <HelmetWrapper>

                    {children}
                    <Modals />
                    <Toaster />
                  </HelmetWrapper>
                </InactivityProvider>
              </Providers>
            </ReactQueryProvider>
          </SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
