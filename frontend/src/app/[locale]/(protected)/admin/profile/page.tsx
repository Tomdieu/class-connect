"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useI18n } from "@/locales/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { UserType } from "@/types";
import AdminProfileCard from "./_components/AdminProfileCard";
import AdminPersonalInfoForm from "./_components/AdminPersonalInfoForm";
import AdminPasswordForm from "./_components/AdminPasswordForm";
import AdminEmailForm from "./_components/AdminEmailForm";

export default function AdminProfilePage() {
  const t = useI18n();
  const { data: session, status } = useSession();
  
  // Default values for forms
  const [personalInfoValues, setPersonalInfoValues] = useState({
    first_name: "",
    last_name: "",
    phone_number: "",
    date_of_birth: "",
    language: "fr" as "fr" | "en",
    town: "",
    quarter: "",
    enterprise_name: "",
    platform_usage_reason: "",
    is_staff: true,
    is_superuser: true,
  });
  
  const [emailValues, setEmailValues] = useState({
    oldEmail: "",
    newEmail: "",
    confirmEmail: "",
  });

  // Update form values when session data is available
  useEffect(() => {
    if (session?.user) {
      const user = session.user as unknown as UserType;
      setPersonalInfoValues({
        first_name: user.first_name || "",
        last_name: user.last_name || "",
        phone_number: user.phone_number || "",
        date_of_birth: user.date_of_birth || "",
        language: (user.language as "fr" | "en") || "fr",
        town: user.town || "",
        quarter: user.quarter || "",
        enterprise_name: user.enterprise_name || "",
        platform_usage_reason: user.platform_usage_reason || "",
        is_staff: user.is_staff || true,
        is_superuser: user.is_superuser || true,
      });
      
      setEmailValues({
        oldEmail: user.email || "",
        newEmail: "",
        confirmEmail: ""
      });
    }
  }, [session]);

  // Show loading state if session is still loading
  if (status === "loading") {
    return <div className="container py-10">
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    </div>;
  }
  
  return (
    <div className="container py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">{t("profile.pageTitle")}</h1>
        <p className="text-muted-foreground mt-2">
          {t("profile.pageDescription")}
        </p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8">
        {/* Admin Profile Card */}
        <div className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <AdminProfileCard 
                userId={session?.user?.id || ""}
                firstName={session?.user?.first_name || ""} 
                lastName={session?.user?.last_name || ""}
                email={session?.user?.email || ""}
                profilePicture={session?.user?.avatar || "/placeholder.png"}
                role="Administrator"
              />
            </CardContent>
          </Card>
        </div>
        
        {/* Tabs for forms */}
        <div>
          <Tabs defaultValue="personal" className="w-full">
            <TabsList className="w-full grid grid-cols-3 mb-8">
              <TabsTrigger value="personal">{t("profile.personalInfo")}</TabsTrigger>
              <TabsTrigger value="password">{t("profile.changePassword")}</TabsTrigger>
              <TabsTrigger value="email">{t("profile.changeEmail")}</TabsTrigger>
            </TabsList>
            
            <TabsContent value="personal" className="mt-0">
              <Card>
                <CardContent className="p-6">
                  <div className="mb-4">
                    <h2 className="text-xl font-semibold">{t("profile.personalInfo")}</h2>
                    <p className="text-sm text-muted-foreground mt-1">
                      {t("profile.personalInfoDesc")}
                    </p>
                  </div>
                  <Separator className="my-4" />
                  <AdminPersonalInfoForm defaultValues={personalInfoValues} />
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="password" className="mt-0">
              <Card>
                <CardContent className="p-6">
                  <div className="mb-4">
                    <h2 className="text-xl font-semibold">{t("profile.changePassword")}</h2>
                    <p className="text-sm text-muted-foreground mt-1">
                      {t("profile.changePasswordDesc")}
                    </p>
                  </div>
                  <Separator className="my-4" />
                  <AdminPasswordForm />
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="email" className="mt-0">
              <Card>
                <CardContent className="p-6">
                  <div className="mb-4">
                    <h2 className="text-xl font-semibold">{t("profile.changeEmail")}</h2>
                    <p className="text-sm text-muted-foreground mt-1">
                      {t("profile.changeEmailDesc")}
                    </p>
                  </div>
                  <Separator className="my-4" />
                  <AdminEmailForm defaultValues={emailValues} />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}