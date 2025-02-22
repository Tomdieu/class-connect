"use client";
import { useState } from 'react';
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useI18n } from "@/locales/client";

const FAQPage = () => {
  const t = useI18n();
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs = [
    {
      question: t("faq.question1"),
      answer: t("faq.answer1")
    },
    {
      question: t("faq.question2"),
      answer: t("faq.answer2")
    },
    {
      question: t("faq.question3"),
      answer: t("faq.answer3")
    }
  ];

  return (
    <div className="min-h-screen flex flex-col">
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
