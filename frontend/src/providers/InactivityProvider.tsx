"use client";
import { useSession } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useCallback, useState } from "react";

// 10 minutes in milliseconds
const INACTIVITY_TIMEOUT = 10 * 60 * 1000;

export default function InactivityProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const lastActivityRef = useRef<number>(Date.now());
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const router = useRouter();
  const [warningShown, setWarningShown] = useState(false);

  // Memoize the update activity handler
  const updateLastActivity = useCallback(() => {
    lastActivityRef.current = Date.now();
    
    // If there was a warning shown, hide it when user is active
    if (warningShown) {
      setWarningShown(false);
    }
  }, [warningShown]);

  // Memoize the inactivity check
  const checkInactivity = useCallback(() => {
    const now = Date.now();
    const timeInactive = now - lastActivityRef.current;
    
    // If user is inactive for the specified time
    if (timeInactive >= INACTIVITY_TIMEOUT) {
      if (session?.user && !warningShown) {
        // Instead of directly signing out, redirect to a custom sign-out page
        router.push(`/timeout?returnUrl=${encodeURIComponent(pathname!)}`);
        setWarningShown(true);
      }
    }
  }, [pathname, session?.user, router, warningShown]);

  useEffect(() => {
    // Only run effect if user is authenticated
    if (status !== "authenticated") return;
    
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
    const intervalId = setInterval(checkInactivity, 30000); // Check every 30 seconds instead of every second
    
    // Cleanup function
    return () => {
      events.forEach((event) => {
        window.removeEventListener(event, updateLastActivity);
      });
      clearInterval(intervalId);
    };
  }, [status, updateLastActivity, checkInactivity]);

  return <>{children}</>;
}