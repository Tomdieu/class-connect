"use client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useI18n } from "@/locales/client";

const HelpPage = () => {
  const t = useI18n();

  return (
    <div className="min-h-screen flex flex-col">
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
