import { BookOpen } from "lucide-react";

export default function Loading() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="animate-pulse">
        <BookOpen className="h-16 w-16 text-primary animate-bounce" strokeWidth={1.5} />
      </div>
    </div>
  );
}
