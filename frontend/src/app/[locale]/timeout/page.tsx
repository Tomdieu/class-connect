"use client";

import { Button } from "@/components/ui/button";
import { useI18n } from "@/locales/client";
import { signOut } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

export default function TimeoutPage() {
  const t = useI18n();
  const searchParams = useSearchParams();
  const returnUrl = searchParams.get("returnUrl") || "/";
  const [countdown, setCountdown] = useState(60);
  
  const handleSignOut = useCallback(() => {
    signOut({
      redirectTo: `/?callbackUrl=${encodeURIComponent(returnUrl)}`,
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
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          {t("timeout.title")}
        </h1>
        <p className="text-gray-600 mb-6">
          {t("timeout.description", { seconds: countdown })}
        </p>
        <div className="flex flex-col space-y-3">
          <Button onClick={handleStaySignedIn} variant="default">
            {t("timeout.staySignedIn")}
          </Button>
          <Button onClick={handleSignOut} variant="outline">
            {t("timeout.signOut")}
          </Button>
        </div>
      </div>
    </div>
  );
}