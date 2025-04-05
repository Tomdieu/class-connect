"use client";
import { useEffect } from "react";

export default function RightClickDisableProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    // Disable right-click
    const disableRightClick = (e: MouseEvent) => {
      e.preventDefault();
    };

    // Disable specific key combinations
    const disableDevToolsKeys = (e: KeyboardEvent) => {
      if (
        e.key === "F12" ||
        (e.ctrlKey && e.shiftKey && ["I", "J", "C"].includes(e.key)) ||
        (e.ctrlKey && e.key === "U")
      ) {
        e.preventDefault();
      }
    };

    // Optional: Detect if DevTools is open (weak method)
    const detectDevTools = () => {
      let threshold = 160;
      const check = () => {
        const widthThreshold = window.outerWidth - window.innerWidth > threshold;
        const heightThreshold = window.outerHeight - window.innerHeight > threshold;
        if (widthThreshold || heightThreshold) {
          alert("Les outils de développement ne sont pas autorisés.");
          window.close(); // Try to close tab (not guaranteed)
        }
      };
      const interval = setInterval(check, 1000);
      return () => clearInterval(interval);
    };

    // Add event listeners
    document.addEventListener("contextmenu", disableRightClick);
    document.addEventListener("keydown", disableDevToolsKeys);
    const cleanupDevToolsDetect = detectDevTools();

    // Cleanup
    return () => {
      document.removeEventListener("contextmenu", disableRightClick);
      document.removeEventListener("keydown", disableDevToolsKeys);
      cleanupDevToolsDetect();
    };
  }, []);

  return <>{children}</>;
}
