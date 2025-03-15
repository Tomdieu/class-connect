"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useI18n } from "@/locales/client";
import { CheckCircle2, CreditCard, Calendar, Phone } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import Confetti from 'react-confetti';
import { useWindowSize } from "@/hooks/use-window-size";

export default function PaymentSuccessPage() {
  const t = useI18n();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showConfetti, setShowConfetti] = useState(true);
  const { width, height } = useWindowSize();
  
  // Extract payment information from query parameters
  const reference = searchParams.get("reference") || "-";
  const amount = searchParams.get("amount") || "0";
  const currency = searchParams.get("currency") || "XAF";
  const operator = searchParams.get("operator") || "-";
  const code = searchParams.get("code") || "-";
  const phone = searchParams.get("phone_number") || "-";
  const firstName = searchParams.get("extra_first_name") || "-";
  const lastName = searchParams.get("extra_last_name") || "-";
  
  // Format the transaction date (current date since the actual transaction date isn't provided)
  const transactionDate = new Date().toLocaleString();
  
  // Format the amount with thousands separator
  const formattedAmount = parseFloat(amount).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
  
  // Hide confetti after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => setShowConfetti(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      {showConfetti && <Confetti width={width} height={height} recycle={false} numberOfPieces={200} />}
      
      <div className="w-full max-w-3xl space-y-6">
        {/* Main Success Card */}
        <Card className="px-8 py-12 text-center bg-white shadow-lg rounded-xl">
          <div className="flex justify-center mb-6">
            <div className="rounded-full bg-green-100 p-4">
              <CheckCircle2 className="h-16 w-16 text-green-600" />
            </div>
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-3">
            {t("payment.success.title")}
          </h1>
          
          <p className="text-gray-600 mb-8">
            {t("payment.success.description")}
          </p>
          
          {/* Transaction Info Card */}
          <div className="bg-gray-50 rounded-lg p-6 mb-8 text-left">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">{t("payment.success.transactionDetails")}</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-3">
                <CreditCard className="h-5 w-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">{t("payment.success.amount")}</p>
                  <p className="font-semibold">{formattedAmount} {currency}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Calendar className="h-5 w-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">{t("payment.success.date")}</p>
                  <p className="font-semibold">{transactionDate}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <svg className="h-5 w-5 text-gray-500" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 14L4 9L9 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M20 20V13C20 11.9391 19.5786 10.9217 18.8284 10.1716C18.0783 9.42143 17.0609 9 16 9H4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <div>
                  <p className="text-sm text-gray-500">{t("payment.success.paymentMethod")}</p>
                  <p className="font-semibold">{operator} Mobile Money</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">{t("payment.success.phoneNumber")}</p>
                  <p className="font-semibold">{phone}</p>
                </div>
              </div>
            </div>
            
            <div className="border-t border-gray-200 mt-4 pt-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">{t("payment.success.transactionCode")}</span>
                <span className="font-mono text-sm">{code}</span>
              </div>
              
              <div className="flex items-center justify-between mt-2">
                <span className="text-sm text-gray-500">{t("payment.success.reference")}</span>
                <span className="font-mono text-sm">{reference}</span>
              </div>
              
              <div className="flex items-center justify-between mt-2">
                <span className="text-sm text-gray-500">{t("payment.success.customer")}</span>
                <span className="font-mono text-sm">{firstName} {lastName}</span>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <Button
              className="w-full bg-primary hover:bg-primary/90 text-white"
              onClick={() => router.push("/students/subscriptions")}
            >
              {t("payment.success.viewSubscription")}
            </Button>
            
            <Button
              variant="outline"
              className="w-full"
              onClick={() => router.push("/redirect")}
            >
              {t("payment.success.backToDashboard")}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
