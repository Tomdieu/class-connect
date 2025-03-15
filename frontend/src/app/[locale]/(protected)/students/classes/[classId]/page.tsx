"use client";

import { getClassSubject, getUserClass } from '@/actions/user-classes';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import SubjectCard from '@/components/students/SubjectCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, BookOpen } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import React from 'react';
import { useI18n } from "@/locales/client";
import { useQuery } from '@tanstack/react-query';

function ClassSubjectsPage() {
  const t = useI18n();
  const params = useParams();
  const classId = parseInt(params.classId as string);
  
  // Add error check for invalid classId
  if (!classId || isNaN(classId)) {
    return (
      <div className="container mx-auto py-6">
        <DashboardHeader
          title={t('common.error')}
          description={t('common.errorDesc', { item: 'class' })}
          icon={<BookOpen className="h-6 w-6" />}
        />
      </div>
    );
  }

  const { data: classInfo, isLoading: classLoading, error: classError } = useQuery({
    queryKey: ['class', classId],
    queryFn: () => getUserClass(classId),
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    refetchOnWindowFocus: false, // Prevent refetch on window focus
  });
  
  const { data: subjects, isLoading: subjectsLoading, error: subjectsError } = useQuery({
    queryKey: ['classSubjects', classId],
    queryFn: () => getClassSubject({ params: { class_id: classId } }),
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    refetchOnWindowFocus: false, // Prevent refetch on window focus
  });
  
  const isLoading = classLoading || subjectsLoading;
  const error = classError || subjectsError;
  
  if (isLoading) {
    return (
      <div className="container mx-auto py-6">
        <Skeleton className="h-10 w-40 mb-4" />
        <Skeleton className="h-12 w-2/3 mb-2" />
        <Skeleton className="h-4 w-1/2 mb-8" />
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-48 w-full" />
          ))}
        </div>
      </div>
    );
  }
  
  if (error || !classInfo) {
    return (
      <div className="container mx-auto py-6">
        <Button variant="ghost" size="sm" asChild className="mb-4">
          <Link href="/students">
            <ArrowLeft className="h-4 w-4 mr-1" />
            {t('common.back')} {t('common.dashboard')}
          </Link>
        </Button>
        
        <DashboardHeader
          title={t('common.error')}
          description={t('common.errorDesc', { item: 'subjects' })}
          icon={<BookOpen className="h-6 w-6" />}
        />
        
        <Card className="mt-6">
          <CardContent className="pt-6">
            <div className="flex justify-center">
              <Button asChild variant="outline" className="mt-4">
                <Link href="/students">{t('common.return', { destination: t('common.dashboard') })}</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <Button variant="ghost" size="sm" asChild className="mb-4">
        <Link href="/students">
          <ArrowLeft className="h-4 w-4 mr-1" />
          {t('common.back')} {t('common.dashboard')}
        </Link>
      </Button>

      <DashboardHeader
        title={classInfo.class_level.name}
        description={t('student.subject.exploreFor', { name: classInfo.class_level.name })}
        icon={<BookOpen className="h-6 w-6" />}
      />

      {subjects && subjects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          {subjects.map((subject) => (
            <SubjectCard 
              key={subject.id} 
              subject={subject}
              classId={classId}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <h3 className="text-xl font-semibold mb-2">{t('student.subject.noSubjects')}</h3>
          <p className="text-muted-foreground">
            {t('student.subject.noSubjectsDesc')}
          </p>
        </div>
      )}
    </div>
  );
}

export default ClassSubjectsPage;
