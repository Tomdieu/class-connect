"use client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useCurrentLocale, useI18n } from "@/locales/client";
import { Helmet } from 'react-helmet-async';

const HelpPage = () => {
  const t = useI18n();
    const locale = useCurrentLocale()
  

  const jsonLdData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "Help Center - ClassConnect",
    "description": "Get help with using ClassConnect platform",
    "mainEntity": {
      "@type": "ItemList",
      "itemListElement": [
        {
          "@type": "HowTo",
          "name": t("help.categories.gettingStarted.title"),
          "description": t("help.categories.gettingStarted.description"),
          "step": [
            {
              "@type": "HowToStep",
              "text": t("help.categories.gettingStarted.item1")
            },
            {
              "@type": "HowToStep",
              "text": t("help.categories.gettingStarted.item2")
            },
            {
              "@type": "HowToStep",
              "text": t("help.categories.gettingStarted.item3")
            }
          ]
        }
      ]
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Helmet>
        <title>{t("help.title")} | ClassConnect</title>
        <meta name="description" content="Centre d'aide ClassConnect - Trouvez toutes les ressources nécessaires pour utiliser notre plateforme d'apprentissage." />
        <link rel="canonical" href={`https://www.classconnect.cm/${locale}/help`} />
        <meta property="og:title" content={`${t("help.title")} | ClassConnect`} />
        <meta property="og:description" content="Centre d'aide ClassConnect - Ressources et guides d'utilisation." />
        <meta property="og:url" content={`https://www.classconnect.cm/${locale}/help`} />
        <meta property="og:type" content="website" />
        <script type="application/ld+json">{JSON.stringify(jsonLdData)}</script>
      </Helmet>
      <Header className="bg-white/80 backdrop-blur-sm border-b border-gray-100 px-5 sticky top-0 z-50" />
      <main className="flex-1 container mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-center mb-12">{t("help.title")}</h1>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {["gettingStarted", "account", "courses", "technical"].map((category) => (
            <div key={category} className="p-6 border rounded-lg hover:shadow-lg transition-shadow">
              <h2 className="text-xl font-semibold mb-4">{t(`help.categories.${category}.title`)}</h2>
              <p className="text-gray-600 mb-4">{t(`help.categories.${category}.description`)}</p>
              <ul className="space-y-2">
                {[1, 2, 3].map((item) => (
                  <li key={item} className="text-blue-600 hover:underline cursor-pointer">
                    {t(`help.categories.${category}.item${item}`)}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default HelpPage;
