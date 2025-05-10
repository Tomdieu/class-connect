"use client";
import { useEffect } from "react";

export default function ScreenshotProtectionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    // Dynamically load NoPrint.js
    const script = document.createElement("script");
    script.src = "https://pdfanticopy.com/noprint.js";
    script.type = "text/javascript";
    script.onload = () => {
      // Configure NoPrint.js variables
      (window as any).noPrint = true;
      (window as any).noCopy = true;
      (window as any).noScreenshot = true;
      (window as any).autoBlur = true;
    };
    document.body.appendChild(script);

    // Cleanup on unmount
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return (
    <div className="relative">
      {/* Transparent Overlay (Prevents many basic capture tools) */}
      <div className="fixed top-0 left-0 w-full h-full bg-transparent pointer-events-none z-50" />
      {children}
    </div>
  );
}