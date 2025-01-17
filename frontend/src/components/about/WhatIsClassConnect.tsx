import { motion } from "framer-motion";
import { useI18n} from "@/locales/client"
import Image from "next/image";

export const WhatIsClassConnect = () => {
  const t = useI18n()
  
  return (
    <motion.section 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <h2 className="text-3xl font-bold text-gray-900">{t("about.whatIs.title")}</h2>
      <div className="grid md:grid-cols-2 gap-8 items-center">
        <div>
          <p className="text-gray-600 leading-relaxed">
            {t("about.whatIs.desc1")}
          </p>
          <p className="text-gray-600 leading-relaxed mt-4">
            {t("about.whatIs.desc2")}
          </p>
        </div>
        <Image 
          src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1471&q=80"
          alt="Plateforme d'apprentissage"
          className="rounded-lg shadow-lg w-full h-[300px] object-cover"
          width={300}
          height={200}
        />
      </div>
    </motion.section>
  );
};