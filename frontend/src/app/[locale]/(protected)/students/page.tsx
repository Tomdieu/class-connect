"use client";

import { getMyClass } from '@/actions/user-classes';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, BookOpen, GraduationCap } from 'lucide-react';
import Link from 'next/link';
import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSubscriptionStore } from '@/store/subscriptionStore';
import { useI18n } from "@/locales/client";
import { useQuery } from '@tanstack/react-query';
import { Skeleton } from '@/components/ui/skeleton';

function StudentHomePage() {
  const router = useRouter();
  const { isLoading, hasActiveSubscription } = useSubscriptionStore();

  useEffect(() => {
    if (!isLoading && hasActiveSubscription === false) {
      router.push('/students/subscriptions');
    }
  }, [isLoading, hasActiveSubscription, router]);

  const t = useI18n();
  
  const { data: myClasses, isLoading: classesLoading, error } = useQuery({
    queryKey: ['myClasses'],
    queryFn: () => getMyClass(),
  });
  
  if (classesLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-primary/5 via-background to-background p-4 sm:p-6">
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
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-primary/5 via-background to-background p-4 sm:p-6">
        <div className="container mx-auto">
          <DashboardHeader 
            title={t('student.dashboard.title')}
            description={t('common.error')}
            icon={<GraduationCap className="h-6 w-6 text-primary" />}
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
      </div>
    );
  }
  
  return (
    <div 
      className="min-h-screen w-full bg-gradient-to-b from-primary/5 via-background to-background" 
      style={{ filter: (!isLoading && hasActiveSubscription === false) ? "blur(10px)" : "none" }}
    >
      <div className="w-full p-4 sm:p-6">
        <div className="animate-fadeIn">
          <DashboardHeader 
            title={t('student.dashboard.title')}
            description={t('student.dashboard.welcome')}
            icon={<GraduationCap className="h-6 w-6 text-primary" />}
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          <Card className="shadow-lg border-primary/20 overflow-hidden bg-card/95 backdrop-blur relative group animate-slideUp hover:shadow-xl transition-all duration-300">
            <div className="absolute top-0 right-0 w-[100px] h-[100px] bg-primary/30 rounded-bl-full z-0 opacity-20"></div>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BookOpen className="h-5 w-5 mr-2 text-primary" />
                {t('student.dashboard.myClasses')}
              </CardTitle>
              <CardDescription>
                {t('student.dashboard.myClassesDesc')}
              </CardDescription>
            </CardHeader>
            <CardContent className="relative z-10">
              {myClasses && myClasses.length > 0 ? (
                <div className="space-y-2">
                  {myClasses.map((classItem, index) => (
                    <Link 
                      href={`/students/classes/${classItem.id}`} 
                      key={classItem.id}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-primary/10 transition-colors group"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <span>{classItem.class_level.name}</span>
                      <ArrowRight className="h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-muted-foreground">{t('student.dashboard.noClasses')}</p>
                  <Button variant="outline" className="mt-2 hover:bg-primary/10 transition-colors" asChild>
                    <Link href="/students/enroll">{t('student.dashboard.enroll')}</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card className="shadow-lg border-primary/20 overflow-hidden bg-card/95 backdrop-blur relative animate-slideUp animation-delay-100 hover:shadow-xl transition-all duration-300">
            <div className="absolute bottom-0 left-0 w-[80px] h-[80px] bg-primary/20 rounded-tr-full z-0 opacity-20"></div>
            <CardHeader>
              <CardTitle>{t('student.dashboard.recentActivity')}</CardTitle>
              <CardDescription>{t('student.dashboard.recentActivityDesc')}</CardDescription>
            </CardHeader>
            <CardContent className="relative z-10">
              <p className="text-muted-foreground text-center py-4">
                {t('student.dashboard.emptyActivity')}
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-primary/20 overflow-hidden bg-card/95 backdrop-blur relative animate-slideUp animation-delay-200 hover:shadow-xl transition-all duration-300">
            <div className="absolute top-0 left-0 w-[70px] h-[70px] bg-primary/20 rounded-br-full z-0 opacity-20"></div>
            <CardHeader>
              <CardTitle>{t('student.dashboard.quickAccess')}</CardTitle>
              <CardDescription>{t('student.dashboard.quickAccessDesc')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 relative z-10">
              <Button variant="outline" className="w-full justify-start hover:bg-primary/10 transition-colors group" asChild>
                <Link href="/students/classes">
                  <BookOpen className="h-4 w-4 mr-2 text-primary group-hover:scale-110 transition-transform" />
                  {t('student.dashboard.browseClasses')}
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default StudentHomePage;