import { motion } from "framer-motion";
import { ChevronLeft } from "lucide-react";
import { Button } from "./ui/button";
import { Introduction } from "./about/Introduction";
import { WhatIsClassConnect } from "./about/WhatIsClassConnect";
import { Features } from "./about/Features";
import { HowItWorks } from "./about/HowItWorks";
import { Conclusion } from "./about/Conclusion";

interface AboutContentProps {
  onClose: () => void;
}

export const AboutContent = ({ onClose }: AboutContentProps) => {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-white z-50 overflow-y-auto"
    >
      <div className="max-w-4xl mx-auto px-6 py-8">
        <Button
          variant="ghost"
          onClick={onClose}
          className="mb-6 hover:bg-blue-50"
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          Retour
        </Button>

        <div className="space-y-12">
          <Introduction />
          <WhatIsClassConnect />
          <Features />
          <HowItWorks />
          <Conclusion />
        </div>
      </div>
    </motion.div>
  );
};