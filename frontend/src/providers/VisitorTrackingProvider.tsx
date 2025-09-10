"use client";

import React, { createContext, useContext, useEffect, ReactNode } from 'react';
import { trackUserVisit, VisitorTrackingData } from '@/actions/visit-tracking';

interface VisitorTrackingContextType {
  trackVisit: () => void;
}

const VisitorTrackingContext = createContext<VisitorTrackingContextType | undefined>(undefined);

interface VisitorTrackingProviderProps {
  children: ReactNode;
}

export function VisitorTrackingProvider({ children }: VisitorTrackingProviderProps) {
  
  const getClientIP = async (): Promise<string> => {
    try {
      // Try to get IP from a public API service
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip || 'unknown';
    } catch (error) {
      console.warn('Could not fetch IP address:', error);
      return 'unknown';
    }
  };

  const trackVisit = async () => {
    try {
      // Check if we're in a browser environment
      if (typeof window === 'undefined') return;

      // Get or create visitor ID
      let visitorId = localStorage.getItem("visitor_id");
      if (!visitorId) {
        visitorId = crypto.randomUUID();
        localStorage.setItem("visitor_id", visitorId);
      }

      // Get client IP address
      const ipAddress = await getClientIP();

      // Collect visitor data
      const visitorData: VisitorTrackingData = {
        visitor_id: visitorId,
        ip_address: ipAddress,
        user_agent: navigator.userAgent,
        referrer: document.referrer || null,
        path: window.location.pathname,
        browser_language: navigator.language,
        screen_width: window.screen.width,
        screen_height: window.screen.height,
      };

      // Send to backend
      await trackUserVisit(visitorData);
    } catch (error) {
      // Silently fail to avoid breaking the user experience
      console.warn('Failed to track visitor:', error);
    }
  };

  useEffect(() => {
    // Track initial visit
    trackVisit();

    // Track route changes (for SPA navigation)
    const handleRouteChange = () => {
      setTimeout(trackVisit, 100); // Small delay to ensure route has changed
    };

    // Listen for popstate (back/forward navigation)
    window.addEventListener('popstate', handleRouteChange);

    // Listen for pushstate/replacestate (programmatic navigation)
    const originalPushState = window.history.pushState;
    const originalReplaceState = window.history.replaceState;

    window.history.pushState = function(...args) {
      originalPushState.apply(window.history, args);
      handleRouteChange();
    };

    window.history.replaceState = function(...args) {
      originalReplaceState.apply(window.history, args);
      handleRouteChange();
    };

    // Cleanup
    return () => {
      window.removeEventListener('popstate', handleRouteChange);
      window.history.pushState = originalPushState;
      window.history.replaceState = originalReplaceState;
    };
  }, []);

  const contextValue: VisitorTrackingContextType = {
    trackVisit,
  };

  return (
    <VisitorTrackingContext.Provider value={contextValue}>
      {children}
    </VisitorTrackingContext.Provider>
  );
}

// Custom hook to use the visitor tracking context
export function useVisitorTracking() {
  const context = useContext(VisitorTrackingContext);
  if (context === undefined) {
    throw new Error('useVisitorTracking must be used within a VisitorTrackingProvider');
  }
  return context;
}

export default VisitorTrackingProvider;
