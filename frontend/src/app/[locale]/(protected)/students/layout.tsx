import { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import StudentProvider from "./provider";

export const metadata: Metadata = {
  title: "Student Dashboard",
  description: "Access your classes, subjects, and learning materials",
};

export default async function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Check if user is authenticated and has student role
  const session = await auth();

  if (!session || !session.user) {
    redirect("/auth/login");
  }

  return (
    <StudentProvider>
      <div className="flex-1 w-full">
        {children}
        {/* Footer - You can add this optionally */}
        <div className="mt-auto w-full pt-4 border-t border-gray-100">
          <div className="px-4 py-3">
            <p className="text-xs text-center text-gray-500">
              Copyright © 2024 ClassConnect
            </p>
          </div>
        </div>
      </div>
    </StudentProvider>
  );
}
