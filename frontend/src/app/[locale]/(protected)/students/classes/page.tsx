"use client";

import { getMyClass } from '@/actions/user-classes';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ArrowLeft, BookOpen, GraduationCap, ArrowRight, Loader2 } from 'lucide-react';
import Link from 'next/link';
import React, { useEffect } from 'react';
import { useI18n } from "@/locales/client";
import { useQuery } from '@tanstack/react-query';
import { Skeleton } from '@/components/ui/skeleton';
import { useRouter } from 'next/navigation';
import { useSubscriptionStore } from '@/store/subscriptionStore';
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

const fadeInVariants = {
  hidden: { opacity: 0 },
  show: { 
    opacity: 1,
    transition: { duration: 0.5 }
  }
};

function BrowseClassesPage() {
  const router = useRouter();
  const { isLoading, hasActiveSubscription } = useSubscriptionStore();

  // useEffect(() => {
  //   if (!isLoading && hasActiveSubscription === false) {
  //     router.push('/students/subscriptions');
  //   }
  // }, [isLoading, hasActiveSubscription, router]);

  const t = useI18n();
  
  const { data: myClasses, isLoading: classesLoading, error } = useQuery({
    queryKey: ['myClasses'],
    queryFn: () => getMyClass(),
  });
  
  if (classesLoading) {
    return (
      <motion.div 
        className="min-h-screen bg-gradient-to-b from-primary/5 via-background to-background p-4 sm:p-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="container mx-auto">
          <Skeleton className="h-12 w-2/3 mb-2" />
          <Skeleton className="h-4 w-1/2 mb-8" />
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="opacity-60 shadow-md border-primary/20 overflow-hidden bg-card/95 backdrop-blur">
                <CardHeader>
                  <Skeleton className="h-6 w-36 mb-2" />
                  <Skeleton className="h-4 w-48" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-20 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </motion.div>
    );
  }
  
  if (error) {
    return (
      <motion.div 
        className="min-h-screen bg-gradient-to-b from-primary/5 via-background to-background p-4 sm:p-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="container mx-auto">
          <DashboardHeader 
            title={t('student.classes.title')}
            description={t('common.error')}
            icon={<BookOpen className="h-6 w-6 text-primary" />}
          />
          <Card className="mt-6 shadow-lg border-primary/20 overflow-hidden bg-card/95 backdrop-blur">
            <CardContent className="pt-6">
              <p className="text-muted-foreground text-center mb-4">
                {t('common.errorDesc', { item: 'classes' })}
              </p>
              <div className="flex justify-center">
                <Button 
                  onClick={() => window.location.reload()}
                  className="bg-primary hover:bg-primary/90 transition-all"
                >
                  {t('plans.retry')}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </motion.div>
    );
  }
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="min-h-screen w-full bg-gradient-to-b from-primary/5 via-background to-background p-4 sm:p-6"
      // style={{ filter: (!isLoading && hasActiveSubscription === false) ? "blur(10px)" : "none" }}
    >
      <motion.div 
        className="relative flex flex-col gap-2 items-center justify-between mb-10 pb-4 border-b border-primary/10 max-w-[2400px] mx-auto"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        {/* <div className="absolute top-0 right-0 w-[150px] h-[150px] bg-primary/10 rounded-bl-full z-0 opacity-20"></div>
        <div className="absolute bottom-0 left-0 w-[100px] h-[100px] bg-primary/10 rounded-tr-full z-0 opacity-10"></div> */}
        <div className="mr-auto">
            <Button variant="ghost" size="sm" asChild className="hover:bg-primary/10 transition-all">
              <Link href="/students">
                <ArrowLeft className="h-4 w-4 mr-1" />
                {t('common.back')} {t('common.dashboard')}
              </Link>
            </Button>
          </div>
        <div className="flex items-center mb-4 relativew-full w-full">
          <div className="bg-primary/10 p-3 rounded-full mr-4">
            <BookOpen className="h-7 w-7 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
              {t('student.classes.title')}
            </h1>
            <p className="text-sm text-gray-600">{t('student.classes.description')}</p>
          </div>
          
        </div>
      </motion.div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="space-y-8 max-w-[2400px] mx-auto"
      >
        {myClasses && myClasses.length > 0 ? (
          <motion.div variants={sectionVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {myClasses.map((classItem, index) => (
              <motion.div
                key={classItem.id}
                variants={fadeInVariants}
                custom={index}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="shadow-lg border-primary/20 overflow-hidden bg-card/95 backdrop-blur relative group animate-slideUp hover:shadow-xl transition-all duration-300" 
                      style={{ animationDelay: `${index * 100}ms` }}>
                  <div className="absolute top-0 right-0 w-[80px] h-[80px] bg-primary/20 rounded-bl-full z-0 opacity-20"></div>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <GraduationCap className="h-5 w-5 mr-2 text-primary" />
                      {classItem.class_level.definition_display}
                    </CardTitle>
                    <CardDescription>
                      School Year: {classItem.school_year.formatted_year}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="relative">
                    <p className="text-muted-foreground mb-4">
                      {t('student.classes.enrolledInfo')}
                    </p>
                    <Button asChild className="w-full justify-between group bg-primary hover:bg-primary/90 transition-all">
                      <Link href={`/students/classes/${classItem.id}`}>
                        {t('student.classes.viewSubjects')}
                        <ArrowRight className="h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div variants={sectionVariants} className="text-center py-12 border rounded-lg mt-6 shadow-lg border-primary/20 bg-card/95 backdrop-blur">
            <div className="bg-primary/10 p-3 rounded-full mx-auto mb-4 w-14 h-14 flex items-center justify-center">
              <BookOpen className="h-7 w-7 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">{t('student.classes.noClasses')}</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              {t('student.classes.notEnrolled')}
            </p>
            <Button asChild className="bg-primary hover:bg-primary/90 transition-all">
              <Link href="/students/enroll">{t('student.dashboard.enroll')}</Link>
            </Button>
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
}

export default BrowseClassesPage;
