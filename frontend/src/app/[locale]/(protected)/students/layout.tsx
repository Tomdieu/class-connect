import { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";

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
  
  // You can add additional role checking here if needed
  // if (session.user.role !== "STUDENT") {
  //   redirect("/");
  // }

  return (
    <div className="flex-1 w-full">
      {children}
    </div>
  );
}
