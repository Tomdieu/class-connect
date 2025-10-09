import type { Metadata } from "next";
import React from "react";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;

  const title = locale === "fr" 
    ? "Conditions d'Utilisation | ClassConnect"
    : "Terms of Service | ClassConnect";

  const description = locale === "fr"
    ? "Consultez les conditions d'utilisation de ClassConnect, la plateforme e-learning au Cameroun. Découvrez vos droits et responsabilités en tant qu'utilisateur."
    : "Review ClassConnect's Terms of Service, the e-learning platform in Cameroon. Learn about your rights and responsibilities as a user.";

  return {
    title,
    description,
    keywords: locale === "fr" 
      ? "conditions utilisation, ClassConnect, e-learning, Cameroun, termes service, règles plateforme"
      : "terms of service, ClassConnect, e-learning, Cameroon, platform rules, user agreement",
    robots: "index, follow",
    alternates: {
      canonical: `https://www.classconnect.cm/${locale}/terms`,
      languages: {
        en: "https://www.classconnect.cm/en/terms",
        fr: "https://www.classconnect.cm/fr/terms",
      },
    },
    openGraph: {
      title,
      description,
      url: `https://www.classconnect.cm/${locale}/terms`,
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

export default function TermsLayout({
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
