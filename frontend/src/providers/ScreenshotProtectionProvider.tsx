"use client";
import { useEffect } from "react";

export default function ScreenshotProtectionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    // ⛔ Prevent right-click
    const disableRightClick = (event: MouseEvent) => {
      event.preventDefault();
      console.warn("Right-click is disabled.");
    };
    document.addEventListener("contextmenu", disableRightClick);

    // 🖥️ Prevent text selection & copying
    const preventCopy = (event: Event) => {
      event.preventDefault();
      console.warn("Copying is disabled.");
    };
    document.addEventListener("selectstart", preventCopy);
    document.addEventListener("copy", preventCopy);

    // Cleanup on unmount
    return () => {
      document.removeEventListener("contextmenu", disableRightClick);
      document.removeEventListener("selectstart", preventCopy);
      document.removeEventListener("copy", preventCopy);
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