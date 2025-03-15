"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useI18n } from "@/locales/client";
import { AlertCircle, ArrowLeft, LifeBuoy, RefreshCw } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

export default function PaymentFailedPage() {
  const t = useI18n();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Get error message from URL if available
  const errorMessage = searchParams.get("error") || t("payment.failed.defaultError");
  const reference = searchParams.get("reference") || "-";
  
  const handleTryAgain = () => {
    // Extract the plan from the URL if available
    const plan = searchParams.get("plan");
    if (plan) {
      router.push(`/subscribe/${plan}`);
    } else {
      router.push("/students/subscriptions");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="max-w-md w-full px-8 py-12 text-center bg-white shadow-lg rounded-xl">
        <div className="flex justify-center mb-6">
          <div className="rounded-full bg-red-100 p-4">
            <AlertCircle className="h-16 w-16 text-red-600" />
          </div>
        </div>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-3">
          {t("payment.failed.title")}
        </h1>
        
        <p className="text-gray-600 mb-6">
          {t("payment.failed.description")}
        </p>
        
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
          <p className="text-red-800 text-sm">
            {errorMessage}
          </p>
        </div>
        
        <div className="space-y-4">
          <Button
            className="w-full bg-primary hover:bg-primary/90 text-white"
            onClick={handleTryAgain}
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            {t("payment.failed.tryAgain")}
          </Button>
          
          <Button
            variant="outline"
            className="w-full"
            onClick={() => window.location.href = "/contact"}
          >
            <LifeBuoy className="mr-2 h-4 w-4" />
            {t("payment.failed.contactSupport")}
          </Button>
          
          <Button
            variant="ghost"
            className="w-full"
            onClick={() => router.push("/api/redirect")}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t("payment.failed.backToDashboard")}
          </Button>
        </div>
        
        <p className="mt-8 text-sm text-gray-500">
          {t("payment.failed.reference")}{" "}
          <span className="font-mono font-medium">{reference}</span>
        </p>
      </Card>
    </div>
  );
}
