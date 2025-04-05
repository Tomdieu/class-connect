"use client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { SubscriptionPlans } from "@/components/SubscriptionPlans";
import { useI18n } from "@/locales/client";
import { Helmet } from 'react-helmet-async';

const PricingPage = () => {
  const t = useI18n();

  const jsonLdData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "Pricing Plans - ClassConnect",
    "description": "View our subscription plans and pricing options",
    "offers": {
      "@type": "AggregateOffer",
      "offers": [
        {
          "@type": "Offer",
          "name": t("subscriptionPlans.basic.name"),
          "description": t("subscriptionPlans.basic.description"),
          "category": "Subscription"
        },
        {
          "@type": "Offer",
          "name": t("subscriptionPlans.standard.name"),
          "description": t("subscriptionPlans.standard.description"),
          "category": "Subscription"
        },
        {
          "@type": "Offer",
          "name": t("subscriptionPlans.premium.name"),
          "description": t("subscriptionPlans.premium.description"),
          "category": "Subscription"
        }
      ]
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Helmet>
        <title>{t("pricing.title")} | ClassConnect</title>
        <meta name="description" content="Découvrez nos forfaits d'abonnement adaptés à vos besoins d'apprentissage." />
        <link rel="canonical" href="https://www.classconnect.cm/pricing" />
        <meta property="og:title" content={`${t("pricing.title")} | ClassConnect`} />
        <meta property="og:description" content="Forfaits d'abonnement ClassConnect" />
        <meta property="og:url" content="https://www.classconnect.cm/pricing" />
        <meta property="og:type" content="website" />
        <script type="application/ld+json">{JSON.stringify(jsonLdData)}</script>
      </Helmet>
      <Header className="bg-white/80 backdrop-blur-sm border-b border-gray-100 px-5 sticky top-0 z-50" />
      <main className="flex-1">
        <div className="py-12 bg-gray-50">
          <div className="container mx-auto px-4">
            {/* <h1 className="text-4xl font-bold text-center mb-4">{t("pricing.title")}</h1>
            <p className="text-gray-600 text-center mb-12">{t("pricing.subtitle")}</p> */}
            <SubscriptionPlans />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PricingPage;
