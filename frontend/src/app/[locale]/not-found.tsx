"use client";

import { useI18n, useCurrentLocale } from "@/locales/client";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Home } from "lucide-react";
import Link from "next/link";
import { Helmet } from "react-helmet-async";

export default function NotFound() {
  const t = useI18n();
  const locale = useCurrentLocale();
  
  // Base URL with locale
  const baseUrl = `https://www.classconnect.cm/${locale}`;
  
  // JSON-LD structured data for not found page - localized
  const jsonLdData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": t('notFound.title'),
    "description": t('notFound.description'),
    "breadcrumb": {
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": locale === 'fr' ? "Accueil" : "Home",
          "item": `https://www.classconnect.cm/${locale}`
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": t('notFound.title'),
          "item": `${baseUrl}/not-found`
        }
      ]
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background px-4 py-24">
      <Helmet>
        <title>{t('notFound.title')} | ClassConnect</title>
        <meta name="description" content={t('notFound.description')} />
        <meta property="og:title" content={`${t('notFound.title')} | ClassConnect`} />
        <meta property="og:description" content={t('notFound.description')} />
        <script type="application/ld+json">{JSON.stringify(jsonLdData)}</script>
      </Helmet>

      <div className="text-center space-y-8 max-w-md">
        <h1 className="text-9xl font-extrabold text-primary">{t('notFound.title')}</h1>
        <h2 className="text-3xl font-bold tracking-tight">{t('notFound.heading')}</h2>
        <p className="text-muted-foreground">{t('notFound.description')}</p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
          <Button variant="outline" onClick={() => window.history.back()} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            {t('notFound.goBack')}
          </Button>
          <Button asChild className="gap-2">
            <Link href="/">
              <Home className="h-4 w-4" />
              {t('notFound.returnHome')}
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}