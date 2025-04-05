"use client";
import { useEffect } from "react";

export default function ConsoleProtectionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    // Detect DevTools opening
    const detectDevTools = () => {
      const widthThreshold = window.outerWidth - window.innerWidth > 160;
      const heightThreshold = window.outerHeight - window.innerHeight > 160;
      
      if (widthThreshold || heightThreshold) {
        // Potential DevTools detected
        document.body.innerHTML = '<h1>Developer tools detected. For security reasons, this page has been blocked.</h1>';
      }
    };

    // Override console methods
    const consoleMessages = [
      "Security warning: Console access detected.",
      "This action has been logged for security purposes.",
      "Using the console on this secure application is prohibited."
    ];
    
    // Replace console methods with warning functions
    const originalConsole = { ...console };
    const methods = ['log', 'info', 'warn', 'error', 'debug', 'clear'];
    
    methods.forEach(method => {
      console[method] = (...args) => {
        const randomMessage = consoleMessages[Math.floor(Math.random() * consoleMessages.length)];
        originalConsole.warn(randomMessage);
        return undefined;
      };
    });
    
    // Detect console opening via keyboard
    const preventF12 = (e: KeyboardEvent) => {
      if (
        e.key === 'F12' || 
        (e.ctrlKey && e.shiftKey && e.key === 'I') ||
        (e.ctrlKey && e.shiftKey && e.key === 'J') ||
        (e.ctrlKey && e.key === 'U')
      ) {
        e.preventDefault();
        alert("Developer tools access is restricted for security reasons.");
        return false;
      }
    };

    // Set up event listeners
    window.addEventListener('resize', detectDevTools);
    document.addEventListener('keydown', preventF12);
    
    // Cleanup on unmount
    return () => {
      window.removeEventListener('resize', detectDevTools);
      document.removeEventListener('keydown', preventF12);
      
      // Restore original console methods
      methods.forEach(method => {
        console[method] = originalConsole[method];
      });
    };
  }, []);

  return <>{children}</>;
}