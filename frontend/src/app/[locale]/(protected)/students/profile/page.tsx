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
import AvatarUploadForm from "@/components/forms/AvatarUploadForm";
import { motion } from "framer-motion";

// Add animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const sectionVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

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
      <motion.div 
        className="min-h-screen bg-gradient-to-b from-primary/5 via-background to-background p-4 sm:p-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="max-w-[2400px] mx-auto">
          <Skeleton className="h-12 w-2/3 mb-2" />
          <Skeleton className="h-4 w-1/2 mb-8" />
          <div className="mt-6 bg-card/95 backdrop-blur border border-primary/20 rounded-lg p-6">
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
      </motion.div>
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
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="min-h-screen w-full bg-gradient-to-b from-primary/5 via-background to-background p-4 sm:p-6"
    >
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="w-full max-w-[2400px] mx-auto mb-6"
      >
        <Button variant="outline" size="sm" asChild className="hover:bg-primary/10 transition-all">
          <Link href="/students">
            <ChevronLeft className="h-4 w-4 mr-1" />
            {t('common.back')} {t('common.dashboard')}
          </Link>
        </Button>
      </motion.div>

      <motion.div 
        className="relative flex flex-col items-center justify-between mb-10 pb-4 border-b border-primary/10 max-w-[2400px] mx-auto"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <div className="absolute top-0 right-0 w-[150px] h-[150px] bg-primary/10 rounded-bl-full z-0 opacity-20"></div>
        <div className="absolute bottom-0 left-0 w-[100px] h-[100px] bg-primary/10 rounded-tr-full z-0 opacity-10"></div>
        
        <div className="flex items-center mb-4 relative z-10 w-full">
          <div className="bg-primary/10 p-3 rounded-full mr-4">
            <User className="h-7 w-7 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
              {t("student.profile.title")}
            </h1>
            <p className="text-sm text-gray-600">{t("student.profile.description")}</p>
          </div>
        </div>
      </motion.div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="space-y-8 max-w-[2400px] mx-auto"
      >
        <motion.div variants={sectionVariants} className="bg-card/95 backdrop-blur shadow-lg border border-primary/20 rounded-lg p-6">
          <Tabs defaultValue="profile" className="w-full">
            <TabsList className="mb-6 grid w-full md:w-[400px] grid-cols-2 bg-primary/10">
              <TabsTrigger value="profile" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <User className="h-4 w-4 mr-2" />
                {t("student.profile.personalTab")}
              </TabsTrigger>
              <TabsTrigger value="password" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <Lock className="h-4 w-4 mr-2" />
                {t("student.profile.passwordTab")}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="profile" className="mt-4 space-y-6">
              <div>
                <h3 className="text-lg font-medium">{t("student.profile.personalInfo")}</h3>
                <p className="text-sm text-muted-foreground">{t("student.profile.personalInfoDesc")}</p>
              </div>
              <Separator className="border-primary/10" />
              
              {userInfo && (
                <div className="mb-8">
                  <h4 className="text-md font-medium mb-2">{t("student.profile.profilePicture")}</h4>
                  <AvatarUploadForm user={userInfo} />
                </div>
              )}
              
              <div className="">
                <ProfileForm user={userInfo!} />
              </div>
            </TabsContent>

            <TabsContent value="password" className="mt-4 space-y-6">
              <div>
                <h3 className="text-lg font-medium">{t("student.profile.changePassword")}</h3>
                <p className="text-sm text-muted-foreground">{t("student.profile.changePasswordDesc")}</p>
              </div>
              <Separator className="border-primary/10" />
              <div className="">
                {userInfo && <PasswordChangeForm userId={userInfo?.id} />}
              </div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

export default StudentProfilePage;
