"use client";

import { getTopic, listResources } from '@/actions/courses';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import ResourceList from '@/components/students/ResourceList';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, BookOpen } from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import React from 'react';
import { useI18n } from "@/locales/client";
import { useQuery } from '@tanstack/react-query';

function TopicDetailPage() {
  const t = useI18n();
  const params = useParams();
  const router = useRouter();
  
  const { classId, subjectId, chapterId, topicId } = params as {
    classId: string;
    subjectId: string;
    chapterId: string;
    topicId: string;
  };
  
  // Fetch topic details
  const { data: topic, isLoading: isLoadingTopic, error: topicError } = useQuery({
    queryKey: ['topic', classId, subjectId, chapterId, topicId],
    queryFn: () => getTopic({
      class_pk: classId,
      subject_pk: subjectId,
      chapter_pk: chapterId,
      topic_pk: topicId,
    }),
  });
  
  // Fetch resources for this topic
  const { data: resources, isLoading: isLoadingResources, error: resourcesError } = useQuery({
    queryKey: ['resources', classId, subjectId, chapterId, topicId],
    queryFn: () => listResources({
      class_pk: classId,
      subject_pk: subjectId,
      chapter_pk: chapterId,
      topic_pk: topicId,
    }),
    enabled: !!topic, // Only fetch resources if topic exists
  });
  
  const isLoading = isLoadingTopic || isLoadingResources;
  const error = topicError || resourcesError;
  
  if (isLoading) {
    return (
      <div className="container mx-auto py-6">
        <Skeleton className="h-10 w-40 mb-4" />
        <Skeleton className="h-12 w-2/3 mb-2" />
        <Skeleton className="h-4 w-1/2 mb-8" />
        
        <Card className="mt-6">
          <CardHeader>
            <Skeleton className="h-6 w-40 mb-2" />
            <Skeleton className="h-4 w-60" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  if (error || !topic) {
    return (
      <div className="container mx-auto py-6">
        <Button variant="ghost" size="sm" asChild className="mb-4">
          <Link href={`/students/classes/${classId}/subjects/${subjectId}`}>
            <ArrowLeft className="h-4 w-4 mr-1" />
            {t('student.topic.backToChapters')}
          </Link>
        </Button>
        
        <DashboardHeader
          title={t('common.error')}
          description={t('common.errorDesc', { item: 'topic details' })}
          icon={<BookOpen className="h-6 w-6" />}
        />
        
        <Card className="mt-6">
          <CardContent className="py-6 text-center">
            <p className="text-muted-foreground mb-4">
              {t('common.errorDesc', { item: 'topic details' })}
            </p>
            <Button variant="outline" asChild>
              <Link href={`/students/classes/${classId}/subjects/${subjectId}`}>
                {t('common.return', { destination: 'subject' })}
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <Button variant="ghost" size="sm" asChild className="mb-4">
        <Link href={`/students/classes/${classId}/subjects/${subjectId}`}>
          <ArrowLeft className="h-4 w-4 mr-1" />
          {t('student.topic.backToChapters')}
        </Link>
      </Button>

      <DashboardHeader
        title={topic.title}
        description={topic.description || t('student.topic.title')}
        icon={<BookOpen className="h-6 w-6" />}
      />

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>{t('student.topic.learningResources')}</CardTitle>
          <CardDescription>
            {t('student.topic.resourcesDesc')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResourceList 
            resources={resources || []}
            classId={parseInt(classId)}
            subjectId={parseInt(subjectId)}
            chapterId={parseInt(chapterId)}
            topicId={parseInt(topicId)}
          />
        </CardContent>
      </Card>
    </div>
  );
}

export default TopicDetailPage;
