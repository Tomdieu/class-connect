"use client";

import { listChapters } from '@/actions/courses';
import { getClassSubject, getUserClass } from '@/actions/user-classes';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import ChapterAccordion from '@/components/students/ChapterAccordion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Book } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import React from 'react';
import { useI18n } from "@/locales/client";
import { useQueries, useQuery } from '@tanstack/react-query';

function SubjectDetailPage() {
  const t = useI18n();
  const params = useParams();
  const classId = parseInt(params.classId as string);
  const subjectId = parseInt(params.subjectId as string);

  const results = useQueries({
    queries: [
      {
        queryKey: ['class', classId],
        queryFn: () => getUserClass(classId),
        enabled: !!classId && !isNaN(classId),
      },
      {
        queryKey: ['classSubjects', classId],
        queryFn: () => getClassSubject({ params: { class_id: classId } }),
        enabled: !!classId && !isNaN(classId),
      },
      {
        queryKey: ['chapters', classId, subjectId],
        queryFn: () => listChapters({
          class_pk: classId.toString(),
          subject_pk: subjectId.toString(),
        }),
        enabled: !!classId && !!subjectId && !isNaN(classId) && !isNaN(subjectId),
      }
    ]
  });
  
  const [classQuery, subjectsQuery, chaptersQuery] = results;
  
  const isLoading = classQuery.isLoading || subjectsQuery.isLoading || chaptersQuery.isLoading;
  const error = classQuery.error || subjectsQuery.error || chaptersQuery.error;

  const classInfo = classQuery.data;
  const subjects = subjectsQuery.data;
  const chapters = chaptersQuery.data;
  
  // Check if the subject exists in the subjects list
  const subject = subjects?.find(s => s.id === subjectId);
  
  if (isLoading) {
    return (
      <div className="container mx-auto py-6">
        <Skeleton className="h-10 w-40 mb-4" />
        <Skeleton className="h-12 w-2/3 mb-2" />
        <Skeleton className="h-4 w-1/2 mb-8" />
        
        <div className="space-y-4 mt-6">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      </div>
    );
  }
  
  if (error || !classInfo || !subject) {
    return (
      <div className="container mx-auto py-6">
        <Button variant="ghost" size="sm" asChild className="mb-4">
          <Link href={`/students/classes/${classId}`}>
            <ArrowLeft className="h-4 w-4 mr-1" />
            {t('student.subject.backToSubjects')}
          </Link>
        </Button>
        
        <DashboardHeader
          title={t('common.error')}
          description={t('common.errorDesc', { item: 'subject details' })}
          icon={<Book className="h-6 w-6" />}
        />
        
        <Card className="mt-6">
          <CardContent className="pt-6">
            <div className="flex justify-center">
              <Button asChild variant="outline" className="mt-4">
                <Link href={`/students/classes/${classId}`}>{t('common.return', { destination: 'class' })}</Link>
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
        <Link href={`/students/classes/${classId}`}>
          <ArrowLeft className="h-4 w-4 mr-1" />
          {t('student.subject.backToSubjects')}
        </Link>
      </Button>

      <DashboardHeader
        title={subject.name}
        description={subject.description || `${classInfo.class_level.name} - ${subject.name}`}
        icon={<Book className="h-6 w-6" />}
      />

      {chapters && chapters.length > 0 ? (
        <div className="mt-6 space-y-4">
          <ChapterAccordion 
            chapters={chapters}
            classId={classId}
            subjectId={subjectId}
          />
        </div>
      ) : (
        <div className="text-center py-12">
          <h3 className="text-xl font-semibold mb-2">{t('student.subject.noChapters')}</h3>
          <p className="text-muted-foreground">
            {t('student.subject.noChaptersDesc')}
          </p>
        </div>
      )}
    </div>
  );
}

export default SubjectDetailPage;
