"use client";

import { getMyTeachers } from '@/actions/enrollments';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Users } from 'lucide-react';
import Link from 'next/link';
import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSubscriptionStore } from '@/store/subscriptionStore';
import { useI18n } from "@/locales/client";
import { useQuery } from '@tanstack/react-query';
import { Skeleton } from '@/components/ui/skeleton';
import { getInitials } from '@/lib/utils';
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

const fadeInVariants = {
  hidden: { opacity: 0 },
  show: { 
    opacity: 1,
    transition: { duration: 0.5 }
  }
};

function MyTeachersPage() {
  const router = useRouter();
  const { isLoading, hasActiveSubscription } = useSubscriptionStore();

  useEffect(() => {
    if (!isLoading && hasActiveSubscription === false) {
      router.push('/students/subscriptions');
    }
  }, [isLoading, hasActiveSubscription, router]);

  const t = useI18n();
  
  const { data: teachers, isLoading: teachersLoading, error } = useQuery({
    queryKey: ['myTeachers'],
    queryFn: () => getMyTeachers(),
  });
  
  if (teachersLoading) {
    return (
      <motion.div 
        className="min-h-screen bg-gradient-to-b from-primary/5 via-background to-background p-4 sm:p-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="max-w-[2400px] mx-auto">
          <Skeleton className="h-12 w-2/3 mb-2" />
          <Skeleton className="h-4 w-1/2 mb-8" />
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="opacity-60 shadow-md border-primary/20 overflow-hidden bg-card/95 backdrop-blur">
                <CardHeader>
                  <Skeleton className="h-12 w-12 rounded-full mb-2" />
                  <Skeleton className="h-6 w-36 mb-2" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-4 w-48 mb-4" />
                  <Skeleton className="h-9 w-32" />
                </CardContent>
              </Card>
            ))}
          </div>
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
      style={{ filter: (!isLoading && hasActiveSubscription === false) ? "blur(10px)" : "none" }}
    >
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="w-full max-w-[2400px] mx-auto mb-6"
      >
        <Button variant="outline" size="sm" asChild className="hover:bg-primary/10 transition-all">
          <Link href="/students">
            <ArrowLeft className="h-4 w-4 mr-1" />
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
            <Users className="h-7 w-7 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
              {t('student.dashboard.myTeachers')}
            </h1>
            <p className="text-sm text-gray-600">Connect with your teachers and access their courses</p>
          </div>
        </div>
      </motion.div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="space-y-8 max-w-[2400px] mx-auto"
      >
        {error ? (
          <motion.div variants={sectionVariants}>
            <Card className="shadow-lg border-primary/20 overflow-hidden bg-card/95 backdrop-blur">
              <CardContent className="pt-6">
                <p className="text-center text-muted-foreground mb-4">
                  {t('common.errorDesc', { item: 'teachers' })}
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
          </motion.div>
        ) : teachers && teachers.length > 0 ? (
          <motion.div variants={sectionVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {teachers.map((enrollment, index) => {
              const teacher = enrollment.teacher;
              return (
                <motion.div
                  key={enrollment.id}
                  variants={fadeInVariants}
                  custom={index}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="shadow-lg border-primary/20 overflow-hidden bg-card/95 backdrop-blur relative group hover:shadow-xl transition-all duration-300">
                    <div className="absolute top-0 right-0 w-[80px] h-[80px] bg-primary/20 rounded-bl-full z-0 opacity-20"></div>
                    <CardHeader className="flex flex-row items-center gap-4">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={teacher.avatar} alt={`${teacher.first_name} ${teacher.last_name}`} />
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {getInitials(`${teacher.first_name} ${teacher.last_name}`)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle>{teacher.first_name} {teacher.last_name}</CardTitle>
                        <CardDescription>{enrollment.offer.subject?.name || "Subject"}</CardDescription>
                      </div>
                    </CardHeader>
                    <CardContent className="relative z-10">
                      <div className="text-sm text-muted-foreground mb-4">
                        <p>Class: {enrollment.offer.class_level?.level || enrollment.offer.class_level?.name || "Class"}</p>
                        <p>Email: {teacher.email}</p>
                        <p>Started: {new Date(enrollment.created_at).toLocaleDateString()}</p>
                      </div>
                      <Button asChild variant="outline" className="w-full hover:bg-primary/10 transition-all">
                        <Link href={`/students/teachers/${enrollment.id}`}>
                          View Details
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>
        ) : (
          <motion.div 
            variants={sectionVariants} 
            className="text-center py-12 border rounded-lg shadow-lg border-primary/20 bg-card/95 backdrop-blur"
          >
            <div className="bg-primary/10 p-3 rounded-full mx-auto mb-4 w-14 h-14 flex items-center justify-center">
              <Users className="h-7 w-7 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No Teachers Found</h3>
            <p className="text-muted-foreground mb-4">
              You don&apos;t have any teachers assigned yet.
            </p>
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
}

export default MyTeachersPage;
