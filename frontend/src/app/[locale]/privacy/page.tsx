"use client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useI18n } from "@/locales/client";

const PrivacyPage = () => {
  const t = useI18n();

  return (
    <div className="min-h-screen flex flex-col">
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
