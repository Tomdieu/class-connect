"use client";
import Link from 'next/link';
import { Frown, ArrowLeft, RefreshCcw } from 'lucide-react';
import { useI18n, useCurrentLocale } from '@/locales/client';
import { Helmet } from 'react-helmet-async';

export default function Custom500() {
  const t = useI18n();
  const locale = useCurrentLocale();
  
  // Base URL with locale for canonical link
  const baseUrl = `https://www.classconnect.cm/${locale}`;
  
  // JSON-LD structured data for the error page
  const jsonLdData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": t('serverError.title') || "Server Error",
    "description": t('serverError.description') || "Something went wrong on our servers. We're working to fix the issue.",
    "isPartOf": {
      "@type": "WebSite",
      "name": "ClassConnect",
      "url": "https://www.classconnect.cm"
    },
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
          "name": "Error 500",
          "item": `${baseUrl}/500`
        }
      ]
    }
  };
  
  return (
    <>
      <Helmet>
        <title>{t('serverError.title') || "Server Error"} | ClassConnect</title>
        <meta name="description" content={t('serverError.description') || "Something went wrong on our servers. We're working to fix the issue."} />
        <link rel="canonical" href={`${baseUrl}/500`} />
        <meta name="robots" content="noindex" />
        <script type="application/ld+json">{JSON.stringify(jsonLdData)}</script>
      </Helmet>
      
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-md text-center space-y-6">
          {/* Error graphic */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center justify-center opacity-10">
              <div className="w-40 h-40 rounded-full bg-red-500"></div>
            </div>
            <div className="relative flex flex-col items-center">
              <div className="p-4 rounded-full bg-red-100 mb-3">
                <Frown className="h-12 w-12 text-red-500" />
              </div>
              <h1 className="text-5xl font-bold text-gray-800 tracking-tight">500</h1>
              <div className="w-16 h-1 bg-red-500 rounded-full my-5"></div>
            </div>
          </div>

          {/* Error message */}
          <div className="space-y-3">
            <h2 className="text-xl md:text-2xl font-semibold text-gray-800">
              {t('serverError.title') || 'Server Error'}
            </h2>
            <p className="text-gray-600">
              {t('serverError.description') || "Something went wrong on our servers. We're working to fix the issue."}
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4 justify-center">
            <Link href="/" className="inline-flex items-center justify-center rounded-md px-5 py-2.5 text-sm font-medium bg-blue-600 text-white shadow hover:bg-blue-700 transition-colors">
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t('common.returnHome') || 'Return Home'}
            </Link>
            <button 
              onClick={() => window.location.reload()}
              className="inline-flex items-center justify-center rounded-md px-5 py-2.5 text-sm font-medium border border-gray-300 bg-white text-gray-700 shadow-sm hover:bg-gray-50 transition-colors"
            >
              <RefreshCcw className="h-4 w-4 mr-2" />
              {t('common.tryAgain') || 'Try Again'}
            </button>
          </div>

          {/* Support information */}
          <p className="text-sm text-gray-500 pt-6">
            {t('serverError.support') || 'If the problem persists, please contact support.'}
          </p>
        </div>
      </div>
    </>
  );
}