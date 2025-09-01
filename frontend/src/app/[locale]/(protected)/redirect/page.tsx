"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

function ProtectedPage() {
  const router = useRouter();

  useEffect(() => {
    // Fallback: if middleware didn't redirect (shouldn't happen), force a refresh
    const timer = setTimeout(() => {
      router.refresh();
    }, 100);

    return () => clearTimeout(timer);
  }, [router]);

  // Minimal loading state - user should rarely see this due to middleware redirect
  return (
    <div className="fixed inset-0 bg-white flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>
  );
}

export default ProtectedPage;
