"use client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useI18n } from "@/locales/client";
import { Helmet } from 'react-helmet-async';

const PrivacyPage = () => {
  const t = useI18n();

  const jsonLdData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "Privacy Policy - ClassConnect",
    "description": "ClassConnect's privacy policy and data protection information",
    "publisher": {
      "@type": "Organization",
      "name": "ClassConnect",
      "sameAs": ["https://www.classconnect.cm"]
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Helmet>
        <title>{t("privacy.title")} | ClassConnect</title>
        <meta name="description" content="Politique de confidentialité de ClassConnect - Découvrez comment nous protégeons vos données." />
        <link rel="canonical" href="https://www.classconnect.cm/privacy" />
        <meta property="og:title" content={`${t("privacy.title")} | ClassConnect`} />
        <meta property="og:description" content="Politique de confidentialité de ClassConnect" />
        <meta property="og:url" content="https://www.classconnect.cm/privacy" />
        <meta property="og:type" content="website" />
        <script type="application/ld+json">{JSON.stringify(jsonLdData)}</script>
      </Helmet>
      <Header className="bg-white/80 backdrop-blur-sm border-b border-gray-100 px-5 sticky top-0 z-50" />
      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-8">{t("privacy.title")}</h1>
          <div className="space-y-8">
            <section>
              <h2 className="text-2xl font-semibold mb-4">{t("privacy.dataCollection.title")}</h2>
              <p className="text-gray-600">{t("privacy.dataCollection.content")}</p>
            </section>
            <section>
              <h2 className="text-2xl font-semibold mb-4">{t("privacy.dataSecurity.title")}</h2>
              <p className="text-gray-600">{t("privacy.dataSecurity.content")}</p>
            </section>
            <section>
              <h2 className="text-2xl font-semibold mb-4">{t("privacy.cookies.title")}</h2>
              <p className="text-gray-600">{t("privacy.cookies.content")}</p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PrivacyPage;
