import type { Metadata } from "next";
import React from "react";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;

  const title = locale === "fr" 
    ? "Politique des Cookies | ClassConnect"
    : "Cookie Policy | ClassConnect";

  const description = locale === "fr"
    ? "Découvrez comment ClassConnect utilise les cookies pour améliorer votre expérience d'apprentissage. Politique transparente sur l'utilisation des cookies."
    : "Learn how ClassConnect uses cookies to enhance your learning experience. Transparent policy on cookie usage and data privacy.";

  return {
    title,
    description,
    keywords: locale === "fr" 
      ? "politique cookies, ClassConnect, confidentialité, e-learning, Cameroun, données personnelles"
      : "cookie policy, ClassConnect, privacy, e-learning, Cameroon, personal data, GDPR",
    robots: "index, follow",
    alternates: {
      canonical: `https://www.classconnect.cm/${locale}/cookies`,
      languages: {
        en: "https://www.classconnect.cm/en/cookies",
        fr: "https://www.classconnect.cm/fr/cookies",
      },
    },
    openGraph: {
      title,
      description,
      url: `https://www.classconnect.cm/${locale}/cookies`,
      siteName: "ClassConnect",
      locale: locale === "fr" ? "fr_FR" : "en_US",
      type: "website",
    },
    twitter: {
      card: "summary",
      title,
      description,
    },
  };
}

export default function CookiesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {children}
    </div>
  );
}
