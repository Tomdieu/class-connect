"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useI18n } from "@/locales/client"; // added
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import PersonalInfoForm from "./_components/PersonalInfoForm";
import PasswordForm from "./_components/PasswordForm";
import EmailForm from "./_components/EmailForm";
import ProfileCard from "./_components/ProfileCard";
  
export default function ProfilePage() {
  const t = useI18n(); // added
  const { data: session, status } = useSession();
  
  // Default values for forms
  const [personalInfoValues, setPersonalInfoValues] = useState({
    phone_number: "",
    date_of_birth: "",
    language: "fr" as "fr" | "en",
    town: "",
    quarter: "",
    enterprise_name: "",
    platform_usage_reason: "",
  });
  
  const [emailValues, setEmailValues] = useState({
    oldEmail: "",
    newEmail: "",
    confirmEmail: "",
  });

  // Update form values when session data is available
  useEffect(() => {
    if (session?.user) {
      setPersonalInfoValues({
        phone_number: session.user.phone_number || "",
        date_of_birth: session.user.date_of_birth || "",
        language: (session.user.language as "fr" | "en") || "fr",
        town: session.user.town || "",
        quarter: session.user.quarter || "",
        enterprise_name: session.user.enterprise_name || "",
        platform_usage_reason: session.user.platform_usage_reason || "",
      });
      
      setEmailValues({
        oldEmail: session.user.email || "",
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
    <div className="container max-w-5xl py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">{t("profile.pageTitle")}</h1>
        <p className="text-muted-foreground mt-2">
          {t("profile.pageDescription")}
        </p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8">
        {/* Profile Card */}
        <div className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <ProfileCard 
                userId={session?.user?.id || ""}
                firstName={session?.user?.first_name || ""} 
                lastName={session?.user?.last_name || ""}
                educationLevel={session?.user?.education_level || ""}
                profilePicture={session?.user?.avatar || "/placeholder.png"}
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
                  <PersonalInfoForm defaultValues={personalInfoValues} />
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
                  <PasswordForm />
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
                  <EmailForm defaultValues={emailValues} />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}