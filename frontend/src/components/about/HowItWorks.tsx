import { motion } from "framer-motion";
import { useI18n } from "@/locales/client";
import Image from "next/image";

export const HowItWorks = () => {
  const t = useI18n();

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <h2 className="text-3xl font-bold text-gray-900">
        {t("about.howItWorks.title")}
      </h2>
      <div className="grid md:grid-cols-2 gap-8 items-center">
        <Image
          src="https://images.unsplash.com/photo-1488590528505-98d2b5aba04b"
          alt="Processus d'inscription"
          className="rounded-lg shadow-lg w-full h-[300px] object-cover"
          height={300}
          width={400}
        />
        <div>
          <h3 className="text-2xl font-semibold text-gray-900 mb-4">
            {t("about.howItWorks.registration")}
          </h3>
          <ul className="space-y-3 text-gray-600">
            {Array.from({length:5}).map((_, index) => {
              const  translate = `about.howItWorks.steps.${index}`;
              return (
                <li key={index}>
                  <span className="font-semibold">{t(translate as keyof typeof t)}</span>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </motion.section>
  );
};
