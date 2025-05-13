"use client";

import { Button } from "@/components/ui/button";
import { useI18n } from "@/locales/client";
import { signOut } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { AlertCircle, ArrowRightCircle, LogOut } from "lucide-react";

export default function TimeoutPage() {
  const t = useI18n();
  const searchParams = useSearchParams();
  const returnUrl = searchParams?.get("returnUrl") || "/";
  const [countdown, setCountdown] = useState(60);
  
  const handleSignOut = useCallback(() => {
    signOut({
      redirectTo: `/auth/login?callbackUrl=${encodeURIComponent(returnUrl)}`,
      redirect: true
    });
  }, [returnUrl]);
  
  const handleStaySignedIn = () => {
    window.location.href = returnUrl;
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSignOut();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [handleSignOut]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-primary/5 via-background to-background">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full mx-4"
      >
        <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-primary/10">
          {/* Progress bar */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gray-100">
            <motion.div 
              className="h-full bg-primary"
              initial={{ width: "100%" }}
              animate={{ width: "0%" }}
              transition={{ duration: 60, ease: "linear" }}
            />
          </div>
          
          <div className="p-8 pt-10">
            <div className="flex justify-center mb-6">
              <div className="p-3 bg-amber-100 rounded-full">
                <AlertCircle className="h-10 w-10 text-amber-600" />
              </div>
            </div>
            
            <h1 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-2">
              {t("timeout.title")}
            </h1>
            
            <p className="text-gray-600 dark:text-gray-300 text-center mb-6">
              {t("timeout.description", { seconds: countdown })}
            </p>
            
            <div className="flex flex-col space-y-3">
              <Button 
                onClick={handleStaySignedIn} 
                className="bg-primary hover:bg-primary/90 text-white py-2 rounded-lg transition-all duration-200 flex items-center justify-center"
              >
                {t("timeout.staySignedIn")}
                <ArrowRightCircle className="ml-2 h-4 w-4" />
              </Button>
              
              <Button 
                onClick={handleSignOut} 
                variant="outline"
                className="border-gray-300 text-gray-700 dark:text-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 py-2 rounded-lg transition-all duration-200 flex items-center justify-center"
              >
                {t("timeout.signOut")}
                <LogOut className="ml-2 h-4 w-4" />
              </Button>
            </div>
            
            <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-700">
              <div className="flex items-center justify-center">
                <div className="bg-primary/10 text-primary font-medium text-sm px-3 py-1 rounded-full">
                  {countdown} {t("timeout.secondsRemaining")}
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}