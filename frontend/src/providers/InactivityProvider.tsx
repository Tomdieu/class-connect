"use client";

import { getCsrfToken, signOut, useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useCallback } from "react";

const INACTIVITY_TIMEOUT = 10 * 60 * 1000; // 10 minutes in milliseconds

export default function InactivityProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const lastActivityRef = useRef<number>(Date.now());
  const { data: session } = useSession();
  const pathname = usePathname();

  // Memoize the update activity handler
  const updateLastActivity = useCallback(() => {
    lastActivityRef.current = Date.now();
  }, []);

  // Memoize the inactivity check
  const checkInactivity = useCallback(() => {
    const now = Date.now();
    
    const logout = async ()=>{
      const csrfToken = await getCsrfToken();
      if(csrfToken){
        signOut({
          redirectTo: `/?callbackUrl=${encodeURIComponent(pathname)}`,
          redirect:true,
        });
      }
    }
    if (now - lastActivityRef.current >= INACTIVITY_TIMEOUT) {
      if (session?.user!==undefined) {
        logout();
      }
    }
  }, [pathname, session?.user]);

  useEffect(() => {
    if (!session?.user) return; // Only run effect if user is authenticated

    // User activity events
    const events = [
      "mousedown",
      "mousemove",
      "keydown",
      "scroll",
      "touchstart",
      "click",
    ] as const;

    // Add event listeners
    events.forEach((event) => {
      window.addEventListener(event, updateLastActivity);
    });

    // Set up interval to check inactivity
    const intervalId = setInterval(checkInactivity, 1000);

    // Cleanup function
    return () => {
      events.forEach((event) => {
        window.removeEventListener(event, updateLastActivity);
      });
      clearInterval(intervalId);
    };
  }, [session?.user, updateLastActivity, checkInactivity]);

  return <>{children}</>;
}