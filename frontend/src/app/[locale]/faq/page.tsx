"use client";
import { useState } from 'react';
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useI18n } from "@/locales/client";
import { Helmet } from 'react-helmet-async';

const FAQPage = () => {
  const t = useI18n();
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const jsonLdData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": t("faq.question1"),
        "acceptedAnswer": {
          "@type": "Answer",
          "text": t("faq.answer1")
        }
      },
      {
        "@type": "Question",
        "name": t("faq.question2"),
        "acceptedAnswer": {
          "@type": "Answer",
          "text": t("faq.answer2")
        }
      },
      {
        "@type": "Question",
        "name": t("faq.question3"),
        "acceptedAnswer": {
          "@type": "Answer",
          "text": t("faq.answer3")
        }
      }
    ]
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Helmet>
        <title>{t("faq.title")} | ClassConnect</title>
        <meta name="description" content="Trouvez des réponses à vos questions sur ClassConnect, la plateforme d'apprentissage en ligne leader au Cameroun." />
        <link rel="canonical" href="https://www.classconnect.cm/faq" />
        <meta property="og:title" content={`${t("faq.title")} | ClassConnect`} />
        <meta property="og:description" content="Trouvez des réponses à vos questions sur ClassConnect." />
        <meta property="og:url" content="https://www.classconnect.cm/faq" />
        <meta property="og:type" content="website" />
        <script type="application/ld+json">{JSON.stringify(jsonLdData)}</script>
      </Helmet>
      <Header className="bg-white/80 backdrop-blur-sm border-b border-gray-100 px-5 sticky top-0 z-50" />
      <main className="flex-1 container mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-center mb-12">{t("faq.title")}</h1>
        <div className="max-w-3xl mx-auto space-y-4">
          {faqs.map((faq, index) => (
            <div key={index} className="border rounded-lg">
              <button
                className="w-full px-6 py-4 text-left font-semibold flex justify-between items-center"
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
              >
                {faq.question}
                <span>{openIndex === index ? '−' : '+'}</span>
              </button>
              {openIndex === index && (
                <div className="px-6 py-4 text-gray-600">
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default FAQPage;
