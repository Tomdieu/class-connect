"use client";
import { useI18n } from "@/locales/client";
import { motion } from "framer-motion";

export const Introduction = () => {
  const t = useI18n();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="text-center mb-12"
    >
      <h1 className="text-4xl font-bold text-gray-900 mb-6">
        {t("about.title")}
      </h1>
      <p className="text-xl text-gray-600 leading-relaxed">
        {t("about.subtitle")}
      </p>
    </motion.div>
  );
};
