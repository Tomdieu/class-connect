"use client";

import { useEffect } from "react";

export default function ScreenshotProtectionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    // ⛔ Prevent right-click
    const disableRightClick = (event: MouseEvent) => event.preventDefault();
    document.addEventListener("contextmenu", disableRightClick);

    // 🛑 Block "Print Screen" key
    const blockPrintScreen = (event: KeyboardEvent) => {
      if (event.key === "PrintScreen") {
        event.preventDefault();
        alert("Screenshots are disabled!");
      }
    };
    document.addEventListener("keydown", blockPrintScreen);

    // 🔍 Detect DevTools / Screen Capture
    const detectDevTools = () => {
      if (window.outerHeight - window.innerHeight > 200 || window.outerWidth - window.innerWidth > 200) {
        document.body.innerHTML = "Screenshot detection triggered!";
      }
    };
    const interval = setInterval(detectDevTools, 1000);

    // 🖥️ Prevent text selection & copying
    document.addEventListener("selectstart", (e) => e.preventDefault());
    document.addEventListener("copy", (e) => e.preventDefault());

    // Cleanup on unmount
    return () => {
      document.removeEventListener("contextmenu", disableRightClick);
      document.removeEventListener("keydown", blockPrintScreen);
      clearInterval(interval);
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
