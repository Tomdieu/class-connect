"use client";

import DashboardHeader from "@/components/dashboard/DashboardHeader";
import { ProfileForm } from "@/components/forms/ProfileForm";
import PasswordChangeForm from "@/components/forms/PasswordChangeForm";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Lock, ChevronLeft, AlertCircle } from "lucide-react";
import React from "react";
import { useI18n } from "@/locales/client";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useQuery } from "@tanstack/react-query";
import { getAccountInfor } from "@/actions/accounts";

function StudentProfilePage() {
  const t = useI18n();
  const { data: session, status: sessionStatus } = useSession();

  // Get access token from session
  const accessToken = session?.user?.accessToken as string;

  // Use React Query directly in the component
  const {
    data: userInfo,
    isLoading: isUserLoading,
    error: userError,
  } = useQuery({
    queryKey: ["userInfo", accessToken],
    queryFn: () => getAccountInfor(accessToken),
    enabled: !!accessToken,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Determine if we're in a loading state
  const isLoading = sessionStatus === "loading" || isUserLoading;

  // Show loading state while session is loading
  if (isLoading) {
    return (
      <div className="container mx-auto py-6">
        <Skeleton className="h-12 w-2/3 mb-2" />
        <Skeleton className="h-4 w-1/2 mb-8" />

        <div className="mt-6">
          <Skeleton className="h-10 w-80 mb-6" />
          <div className="space-y-6">
            <div>
              <Skeleton className="h-6 w-48 mb-2" />
              <Skeleton className="h-4 w-96 mb-4" />
            </div>
            <Skeleton className="h-1 w-full mb-6" />

            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ))}
              <Skeleton className="h-10 w-32 mt-4" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Handle error state
  if (userError) {
    return (
      <div className="container mx-auto py-6">
        <DashboardHeader
          title={t("student.profile.title")}
          description={t("student.profile.description")}
          icon={<User className="h-6 w-6" />}
          showNavigation={true}
          currentPath={t("nav.profile")}
        />

        <Alert variant="destructive" className="mt-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>{t("common.error")}</AlertTitle>
          <AlertDescription>{t("error.failedToLoadProfile")}</AlertDescription>
        </Alert>

        <Button variant="outline" size="sm" asChild className="mt-4">
          <Link href="/students">
            <ChevronLeft className="h-4 w-4 mr-1" />
            {t("common.back")} {t("common.dashboard")}
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <DashboardHeader
        title={t("student.profile.title")}
        description={t("student.profile.description")}
        icon={<User className="h-6 w-6" />}
        showNavigation={true}
        currentPath={t("nav.profile")}
      />

      <div className="mt-6">
        <Button variant="outline" size="sm" asChild className="mb-6">
          <Link href="/students">
            <ChevronLeft className="h-4 w-4 mr-1" />
            {t("common.back")} {t("common.dashboard")}
          </Link>
        </Button>

        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="mb-6 grid w-full md:w-[400px] grid-cols-2">
            <TabsTrigger value="profile">
              <User className="h-4 w-4 mr-2" />
              {t("student.profile.personalTab")}
            </TabsTrigger>
            <TabsTrigger value="password">
              <Lock className="h-4 w-4 mr-2" />
              {t("student.profile.passwordTab")}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="mt-4">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium">
                  {t("student.profile.personalInfo")}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {t("student.profile.personalInfoDesc")}
                </p>
              </div>
              <Separator />
              <div className="max-w-2xl">
                <ProfileForm user={userInfo!} />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="password" className="mt-4">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium">
                  {t("student.profile.changePassword")}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {t("student.profile.changePasswordDesc")}
                </p>
              </div>
              <Separator />
              <div className="max-w-2xl">
                {userInfo && <PasswordChangeForm userId={userInfo?.id} />}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default StudentProfilePage;
