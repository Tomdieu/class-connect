"use client";

import { signOut, useSession } from "next-auth/react";
import { useEffect, useRef } from "react";

const INACTIVITY_TIMEOUT = 5 * 60 * 1000; // 5 minutes in milliseconds

export default function InactivityProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const lastActivityRef = useRef<number>(Date.now());
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { data: session } = useSession();

  useEffect(() => {
    const updateLastActivity = () => {
      lastActivityRef.current = Date.now();
    };

    const checkInactivity = () => {
      const now = Date.now();
      if (now - lastActivityRef.current >= INACTIVITY_TIMEOUT) {
        // User has been inactive for 5 minutes
        if(!session?.user){
          return;
        }
        if (session?.user) {
          signOut();
        }
      }
    };

    // Add event listeners for user activity
    const events = [
      "mousedown",
      "mousemove",
      "keydown",
      "scroll",
      "touchstart",
      "click",
    ];

    events.forEach((event) => {
      window.addEventListener(event, updateLastActivity);
    });

    // Set up interval to check inactivity
    const intervalId = setInterval(checkInactivity, 1000); // Check every second

    // Store current timeout ref value for cleanup
    const currentTimeoutRef = timeoutRef.current;

    return () => {
      // Cleanup
      events.forEach((event) => {
        window.removeEventListener(event, updateLastActivity);
      });
      clearInterval(intervalId);
      if (currentTimeoutRef) {
        clearTimeout(currentTimeoutRef);
      }
    };
  }, []); // Empty dependency array since we're using refs

  return <>{children}</>;
}
