"use client";

import React, { useState } from "react";
import { ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQSectionProps {
  locale: string;
  className?: string;
}

const FAQSection: React.FC<FAQSectionProps> = ({ locale, className }) => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqsFr: FAQItem[] = [
    {
      question: "Qu'est-ce que ClassConnect ?",
      answer:
        "ClassConnect est une plateforme d'e-learning innovante au Cameroun qui offre des cours en ligne personnalisés pour tous les niveaux d'éducation. Nous proposons des cours interactifs avec des enseignants qualifiés et une communauté active.",
    },
    {
      question: "Comment puis-je m'inscrire sur ClassConnect ?",
      answer:
        "L'inscription est simple et rapide. Cliquez sur le bouton 'Commencer' en haut de la page, remplissez le formulaire d'inscription avec vos informations, et vous pourrez accéder immédiatement à notre plateforme.",
    },
    {
      question: "Quels sont les moyens de paiement acceptés ?",
      answer:
        "Nous acceptons plusieurs moyens de paiement incluant Mobile Money (MTN, Orange). Tous les paiements sont 100% sécurisés.",
    },
    {
      question: "Les cours sont-ils disponibles en ligne 24/7 ?",
      answer:
        "Oui, tous nos cours sont disponibles 24h/24 et 7j/7. Vous pouvez apprendre à votre propre rythme et accéder au contenu à tout moment depuis votre ordinateur, tablette ou smartphone.",
    },
    // {
    //   question: "Puis-je obtenir un certificat à la fin de mes cours ?",
    //   answer:
    //     "Oui, après avoir complété avec succès un cours, vous recevrez un certificat de complétion numérique que vous pourrez télécharger et partager sur vos réseaux professionnels.",
    // },
    {
      question: "Y a-t-il un support technique disponible ?",
      answer:
        "Absolument ! Notre équipe de support technique est disponible 24/7 par email, chat en direct et téléphone pour vous aider avec toute question ou problème technique.",
    },
  ];

  const faqsEn: FAQItem[] = [
    {
      question: "What is ClassConnect?",
      answer:
        "ClassConnect is an innovative e-learning platform in Cameroon that offers personalized online courses for all education levels. We provide interactive courses with qualified teachers and an active community.",
    },
    {
      question: "How can I register on ClassConnect?",
      answer:
        "Registration is simple and quick. Click the 'Get Started' button at the top of the page, fill in the registration form with your information, and you'll have immediate access to our platform.",
    },
    {
      question: "What payment methods are accepted?",
      answer:
        "We accept multiple payment methods including Mobile Money (MTN, Orange). All payments are 100% secure.",
    },
    {
      question: "Are courses available online 24/7?",
      answer:
        "Yes, all our courses are available 24/7. You can learn at your own pace and access content anytime from your computer, tablet or smartphone.",
    },
    // {
    //   question: "Can I get a certificate after completing my courses?",
    //   answer:
    //     "Yes, after successfully completing a course, you will receive a digital completion certificate that you can download and share on your professional networks.",
    // },
    {
      question: "Is technical support available?",
      answer:
        "Absolutely! Our technical support team is available 24/7 via email, live chat and phone to help you with any questions or technical issues.",
    },
  ];

  const faqs = locale === "fr" ? faqsFr : faqsEn;

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  // Generate FAQ Schema for SEO
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };

  return (
    <section
      className={cn(
        "min-h-screen flex items-center justify-center bg-gradient-to-b from-white via-gray-50 to-white relative overflow-hidden py-20",
        className
      )}
      aria-label={locale === "fr" ? "Questions fréquentes" : "Frequently asked questions"}
    >
      {/* Inject FAQ Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      {/* Background decorations */}
      <div className="absolute top-0 right-1/4 w-72 h-72 bg-blue-500/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-purple-500/5 rounded-full blur-3xl"></div>

      <div className="container mx-auto px-4 py-12 md:py-20 w-full relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
            <span className="text-primary font-semibold tracking-wider uppercase text-sm">
              {locale === "fr" ? "FAQ" : "FAQ"}
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-5 tracking-tight">
            {locale === "fr"
              ? "Questions Fréquemment Posées"
              : "Frequently Asked Questions"}
          </h2>
          <div className="w-24 h-1.5 bg-primary mx-auto rounded-full mb-5"></div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            {locale === "fr"
              ? "Trouvez les réponses aux questions les plus courantes sur ClassConnect"
              : "Find answers to the most common questions about ClassConnect"}
          </p>
        </motion.div>

        <div className="max-w-4xl mx-auto space-y-4">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
                aria-expanded={openIndex === index}
              >
                <span className="text-lg font-semibold text-gray-900 pr-4">
                  {faq.question}
                </span>
                <motion.div
                  animate={{ rotate: openIndex === index ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                  className="flex-shrink-0"
                >
                  <ChevronDown className="h-5 w-5 text-primary" />
                </motion.div>
              </button>

              <AnimatePresence>
                {openIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="px-6 pb-5 text-gray-600 leading-relaxed">
                      {faq.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <p className="text-gray-600 mb-4">
            {locale === "fr"
              ? "Vous ne trouvez pas ce que vous cherchez ?"
              : "Can't find what you're looking for?"}
          </p>
          <a
            href={`/${locale}/contact`}
            className="inline-flex items-center px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-semibold"
          >
            {locale === "fr" ? "Contactez-nous" : "Contact Us"}
          </a>
        </motion.div>
      </div>
    </section>
  );
};

export default FAQSection;
