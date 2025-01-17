"use client";
import { motion } from "framer-motion";
import { useI18n } from "@/locales/client";

export const Features = () => {
  const t = useI18n();

  const features = [
    {
      title: t("features.courseManagement.title"),
      items: [
        t("features.courseManagement.items.0"),
        t("features.courseManagement.items.1"),
        t("features.courseManagement.items.2"),
      ],
      image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085",
      alt: "Gestion des cours",
    },
    {
      title: t("features.virtualClassroom.title"),
      items: [
        t("features.virtualClassroom.items.0"),
        t("features.virtualClassroom.items.1"),
        t("features.virtualClassroom.items.2"),
      ],
      image: "https://images.unsplash.com/photo-1605810230434-7631ac76ec81",
      alt: "Salle de classe virtuelle",
    },
    {
      title: t("features.experience.title"),
      items: [
        t("features.experience.items.0"),
        t("features.experience.items.1"),
        t("features.experience.items.2"),
        t("features.experience.items.3"),
        t("features.experience.items.4"),
      ],
      image: "https://images.unsplash.com/photo-1649972904349-6e44c42644a7",
      alt: "Personnalisation de l'expérience",
    },
    {
      title: t("features.subscriptions.title"),
      items: [
        t("features.subscriptions.items.0"),
        t("features.subscriptions.items.1"),
        t("features.subscriptions.items.2"),
      ],
      image: "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d",
      alt: "Abonnements adaptés",
    },
    {
      title: t("features.payments.title"),
      items: [
        t("features.payments.items.0"),
        t("features.payments.items.1"),
        t("features.payments.items.2"),
      ],
      image: "https://images.unsplash.com/photo-1434494878577-86c23bcb06b9",
      alt: "Paiements sécurisés",
    },
    {
      title: t("features.support.title"),
      items: [
        t("features.support.items.0"),
        t("features.support.items.1"),
      ],
      image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158",
      alt: "Assistance personnalisée",
    },
  ];

  return (
    <motion.section 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <h2 className="text-3xl font-bold text-gray-900">{t("features.title")}</h2>
      
      <div className="space-y-8">
        {features.map((feature, index) => (
          <div key={index} className="grid md:grid-cols-2 gap-8 items-center">
            <img 
              src={feature.image}
              alt={feature.alt}
              className="rounded-lg shadow-lg w-full h-[300px] object-cover"
            />
            <div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">{feature.title}</h3>
              <ul className="space-y-3 text-gray-600">
                {feature.items.map((item, idx) => (
                  <li key={idx}>• {item}</li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </motion.section>
  );
};