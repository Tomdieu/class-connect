"use client";

import { getMyClass } from '@/actions/user-classes';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, BookOpen } from 'lucide-react';
import Link from 'next/link';
import React from 'react';
import { useI18n } from "@/locales/client";
import { useQuery } from '@tanstack/react-query';
import { Skeleton } from '@/components/ui/skeleton';

function BrowseClassesPage() {
  const t = useI18n();
  
  const { data: myClasses, isLoading, error } = useQuery({
    queryKey: ['myClasses'],
    queryFn: () => getMyClass(),
  });
  
  if (isLoading) {
    return (
      <div className="container mx-auto py-6">
        <Skeleton className="h-10 w-40 mb-4" />
        <Skeleton className="h-12 w-2/3 mb-2" />
        <Skeleton className="h-4 w-1/2 mb-8" />
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="opacity-60">
              <CardHeader>
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
    );
  }
  
  if (error) {
    return (
      <div className="container mx-auto py-6">
        <Button variant="ghost" size="sm" asChild className="mb-4">
          <Link href="/students">
            <ArrowLeft className="h-4 w-4 mr-1" />
            {t('common.back')} {t('common.dashboard')}
          </Link>
        </Button>
        <DashboardHeader
          title={t('student.classes.title')}
          description={t('common.error')}
          icon={<BookOpen className="h-6 w-6" />}
        />
        <Card className="mt-6">
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground mb-4">
              {t('common.errorDesc', { item: 'classes' })}
            </p>
            <div className="flex justify-center">
              <Button onClick={() => window.location.reload()}>
                {t('plans.retry')}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-6">
      <DashboardHeader
        title={t('student.classes.title')}
        description={t('student.classes.description')}
        icon={<BookOpen className="h-6 w-6" />}
        showNavigation={true}
        currentPath={t('student.classes.title')}
      />
      
      <Button variant="outline" size="sm" asChild className="mb-6">
        <Link href="/students">
          <ArrowLeft className="h-4 w-4 mr-1" />
          {t('common.back')} {t('common.dashboard')}
        </Link>
      </Button>

      {myClasses && myClasses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          {myClasses.map((classItem) => (
            <Card 
              key={classItem.id} 
              className="hover:shadow-md transition-all"
            >
              <CardHeader>
                <CardTitle>{classItem.class_level.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  School Year: {classItem.school_year.formatted_year}
                </p>
                <Button asChild>
                  <Link href={`/students/classes/${classItem.id}`}>
                    {t('student.classes.viewSubjects')}
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 border rounded-lg mt-6">
          <h3 className="text-xl font-semibold mb-2">{t('student.classes.noClasses')}</h3>
          <p className="text-muted-foreground mb-4">
            {t('student.classes.notEnrolled')}
          </p>
          <Button asChild>
            <Link href="/students/enroll">{t('student.dashboard.enroll')}</Link>
          </Button>
        </div>
      )}
    </div> 
  );
}

export default BrowseClassesPage;
