"use client"
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useI18n } from "@/locales/client";

const FloatingCTA: React.FC = () => {
  const t = useI18n();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      setVisible(scrollY > 600);
    };
    
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ 
        opacity: visible ? 1 : 0, 
        scale: visible ? 1 : 0.8 
      }}
      transition={{ 
        type: "spring", 
        stiffness: 300, 
        damping: 30 
      }}
      className="fixed bottom-6 right-6 z-50"
    >
      <Link href="/auth/register">
        <div className="relative group">
          {/* Animated glow ring */}
          <motion.div 
            className="absolute -inset-1 bg-gradient-to-r from-primary to-primary/60 rounded-full opacity-60 blur-sm"
            animate={{ 
              scale: [1, 1.05, 1],
            }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          
          <Button
            size="lg"
            className="relative h-14 px-6 bg-primary hover:bg-primary/90 text-primary-foreground rounded-full shadow-lg hover:shadow-xl border border-primary/20 backdrop-blur-sm transition-all duration-200 group-hover:scale-105"
          >
            <span className="font-medium">
              {t("hero.start")}
            </span>
            <ArrowRight className="h-4 w-4 ml-2 transition-transform duration-200 group-hover:translate-x-0.5" />
          </Button>
        </div>
      </Link>
    </motion.div>
  );
};

export default FloatingCTA;