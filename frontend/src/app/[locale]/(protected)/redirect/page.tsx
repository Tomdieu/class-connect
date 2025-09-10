"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { BookOpen } from "lucide-react";

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
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="animate-pulse">
        <BookOpen className="h-16 w-16 text-primary animate-bounce" strokeWidth={1.5} />
      </div>
    </div>
  );
}

export default ProtectedPage;
