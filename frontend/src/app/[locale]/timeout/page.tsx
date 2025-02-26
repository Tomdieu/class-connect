"use client";

import { signOut } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

export default function TimeoutPage() {
  const searchParams = useSearchParams();
  const returnUrl = searchParams.get("returnUrl") || "/";
  const [countdown, setCountdown] = useState(60); // 60 second countdown
  
  // Define handleSignOut outside of useEffect and without useCallback
  const handleSignOut = useCallback(() => {
    signOut({
      redirectTo: `/?callbackUrl=${encodeURIComponent(returnUrl)}`,
      redirect:true
    });
  },[returnUrl]);
  
  const handleStaySignedIn = () => {
    window.location.href = returnUrl;
  };

  useEffect(() => {
    // Auto sign-out after 60 seconds
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
  }, [handleSignOut, returnUrl]); // Only depend on returnUrl, not handleSignOut

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Session Timeout</h1>
        <p className="text-gray-600 mb-6">
          Your session is about to expire due to inactivity. You will be automatically signed out in {countdown} seconds.
        </p>
        <div className="flex flex-col space-y-3">
          <Button onClick={handleStaySignedIn} variant="default">
            Stay Signed In
          </Button>
          <Button onClick={handleSignOut} variant="outline">
            Sign Out Now
          </Button>
        </div>
      </div>
    </div>
  );
}