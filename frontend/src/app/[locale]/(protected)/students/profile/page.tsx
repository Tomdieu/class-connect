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

// Animation variants
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
      <div className="container max-w-5xl mx-auto py-8 px-4">
        <Skeleton className="h-12 w-2/3 mb-2" />
        <Skeleton className="h-4 w-1/2 mb-8" />
        <div className="space-y-6">
          <Skeleton className="h-[400px] rounded-xl" />
        </div>
      </div>
    );
  }

  // Handle error state
  if (userError) {
    return (
      <div className="container max-w-5xl mx-auto py-8 px-4">
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
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="container max-w-5xl mx-auto py-8 px-4"
    >
      <motion.div variants={sectionVariants} className="mb-8">
        <Button 
          variant="ghost" 
          size="sm" 
          asChild 
          className="rounded-full hover:bg-primary/10 transition-all mb-4"
        >
          <Link href="/students">
            <ChevronLeft className="h-4 w-4 mr-1" />
            {t('common.back')}
          </Link>
        </Button>

        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary to-blue-500 bg-clip-text text-transparent">
              {t("student.profile.title")}
            </h1>
            <p className="text-muted-foreground mt-1">{t("student.profile.description")}</p>
          </div>
          
          {userInfo && (
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="hidden md:block mt-4 md:mt-0"
            >
              <AvatarUploadForm user={userInfo} />
            </motion.div>
          )}
        </div>
      </motion.div>

      <motion.div 
        variants={sectionVariants} 
        className="bg-card/80 backdrop-blur-sm border border-primary/10 shadow-xl rounded-2xl overflow-hidden"
      >
        <Tabs defaultValue="profile" className="w-full">
          <div className="px-6 pt-6 border-b border-primary/10 pb-4">
            <TabsList className="grid w-full max-w-md grid-cols-2 bg-muted/50">
              <TabsTrigger 
                value="profile" 
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg py-3"
              >
                <User className="h-4 w-4 mr-2" />
                {t("student.profile.personalTab")}
              </TabsTrigger>
              <TabsTrigger 
                value="password" 
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg py-3"
              >
                <Lock className="h-4 w-4 mr-2" />
                {t("student.profile.passwordTab")}
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="profile" className="p-6 space-y-8 focus:outline-none">
            <div>
              <h3 className="text-xl font-semibold text-foreground">{t("student.profile.personalInfo")}</h3>
              <p className="text-sm text-muted-foreground mt-1">{t("student.profile.personalInfoDesc")}</p>
            </div>
            <Separator className="bg-primary/10" />
            
            <div className="md:hidden mb-8">
              {userInfo && (
                <div>
                  <h4 className="text-md font-medium mb-3">{t("student.profile.profilePicture")}</h4>
                  <AvatarUploadForm user={userInfo} />
                </div>
              )}
            </div>
            
            <div className="bg-muted/30 p-6 rounded-xl border border-muted/50 shadow-sm">
              <ProfileForm user={userInfo!} />
            </div>
          </TabsContent>

          <TabsContent value="password" className="p-6 space-y-8 focus:outline-none">
            <div>
              <h3 className="text-xl font-semibold text-foreground">{t("student.profile.changePassword")}</h3>
              <p className="text-sm text-muted-foreground mt-1">{t("student.profile.changePasswordDesc")}</p>
            </div>
            <Separator className="bg-primary/10" />
            <div className="bg-muted/30 p-6 rounded-xl border border-muted/50 shadow-sm">
              {userInfo && <PasswordChangeForm userId={userInfo?.id} />}
            </div>
          </TabsContent>
        </Tabs>
      </motion.div>
    </motion.div>
  );
}

export default StudentProfilePage;
