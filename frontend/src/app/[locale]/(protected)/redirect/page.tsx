"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

function ProtectedPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function handleRedirect() {
      if (status === "loading") return;
      
      try {
        // Call the redirect API but specify we want JSON response
        const response = await fetch('/api/redirect?json=true', {
          method: 'GET',
          headers: {
            'X-Prefer-Json': 'true'
          }
        });
        
        if (!response.ok) {
          throw new Error('Redirect API call failed');
        }
        
        const data = await response.json();
        
        // Use the router to perform client-side navigation with the relative path
        // This avoids hostname issues
        if (data.redirectUrl) {
          router.push(data.redirectUrl);
        } else {
          // Fallback to login if no redirect URL is returned
          router.push('/auth/login');
        }
      } catch (error) {
        console.error('Error during redirect:', error);
        // Fallback to login in case of errors
        router.push('/auth/login');
      } finally {
        setIsLoading(false);
      }
    }
    
    handleRedirect();
  }, [status, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="spinner-border animate-spin inline-block w-8 h-8 border-4 rounded-full" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Redirecting...</p>
        </div>
      </div>
    );
  }

  return null;
}

export default ProtectedPage;
