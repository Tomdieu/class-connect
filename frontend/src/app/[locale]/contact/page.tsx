"use client";
import { useState } from 'react';
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useCurrentLocale, useI18n } from "@/locales/client";
import { Helmet } from 'react-helmet-async';

const ContactPage = () => {
  const t = useI18n();
  const locale = useCurrentLocale()
  
  const jsonLdData = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    "name": "Contact ClassConnect",
    "description": "Get in touch with ClassConnect support team",
    // "publisher": {
    //   "@type": "Organization",
    //   "name": "ClassConnect",
    //   "sameAs": ["https://www.classconnect.cm"]
    // },
    "mainEntity": {
      "@type": "ContactPoint",
      "contactType": "customer support",
      "availableLanguage": ["English", "French"]
    }
  };

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    console.log(formData);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Helmet>
        <title>{t("contact.title")} | ClassConnect</title>
        <meta name="description" content="Contactez l'équipe ClassConnect pour toute question ou assistance." />
        <link rel="canonical" href={`https://www.classconnect.cm/${locale}/contact`} />
        <meta property="og:title" content={`${t("contact.title")} | ClassConnect`} />
        <meta property="og:description" content="Contactez l'équipe ClassConnect" />
        <meta property="og:url" content={`https://www.classconnect.cm/${locale}/contact`} />
        <meta property="og:type" content="website" />
        <script type="application/ld+json">{JSON.stringify(jsonLdData)}</script>
      </Helmet>
      <Header className="bg-white/80 backdrop-blur-sm border-b border-gray-100 px-5 sticky top-0 z-50" />
      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-4xl font-bold text-center mb-8">{t("contact.title")}</h1>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t("contact.form.name")}</label>
              <input
                type="text"
                className="w-full px-4 py-2 border rounded-lg"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t("contact.form.email")}</label>
              <input
                type="email"
                className="w-full px-4 py-2 border rounded-lg"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t("contact.form.subject")}</label>
              <input
                type="text"
                className="w-full px-4 py-2 border rounded-lg"
                value={formData.subject}
                onChange={(e) => setFormData({...formData, subject: e.target.value})}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t("contact.form.message")}</label>
              <textarea
                className="w-full px-4 py-2 border rounded-lg h-32"
                value={formData.message}
                onChange={(e) => setFormData({...formData, message: e.target.value})}
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
            >
              {t("contact.form.submit")}
            </button>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ContactPage;
