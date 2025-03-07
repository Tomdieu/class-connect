"use client";

import React from 'react';
import { listResources, getTopic } from '@/actions/courses';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import PDFDisplay from '@/components/PDFDisplay';
import VideoReader from '@/components/VideoReader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, BookOpen, FileText, Film, PenTool } from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { ExerciseResourceType, PDFResourceType, RevisionResourceType, VideoResourceType } from '@/types';
import { useI18n } from '@/locales/client';
import { useQuery } from '@tanstack/react-query';
import { Skeleton } from '@/components/ui/skeleton';

function ResourceDetailPage() {
  const t = useI18n();
  const params = useParams();
  
  const { classId, subjectId, chapterId, topicId, resourceId } = params as {
    classId: string;
    subjectId: string;
    chapterId: string;
    topicId: string;
    resourceId: string;
  };
  
  // Fetch topic details for context
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
  
  // Find the specific resource
  const resourceItem = resources?.find(r => r.id.toString() === resourceId);
  
  if (isLoading) {
    return (
      <div className="container mx-auto py-6">
        <Skeleton className="h-10 w-40 mb-4" />
        <Skeleton className="h-12 w-2/3 mb-2" />
        <Skeleton className="h-4 w-1/2 mb-8" />
        
        <div className="mt-6">
          <Skeleton className="h-[400px] w-full rounded-lg" />
        </div>
      </div>
    );
  }
  
  if (error || !topic || !resourceItem) {
    return (
      <div className="container mx-auto py-6">
        <Button variant="ghost" size="sm" asChild className="mb-4">
          <Link href={`/students/classes/${classId}/subjects/${subjectId}/chapters/${chapterId}/topics/${topicId}`}>
            <ArrowLeft className="h-4 w-4 mr-1" />
            {t('student.resource.backToTopic')}
          </Link>
        </Button>
        
        <DashboardHeader
          title={t('common.error')}
          description={t('common.errorDesc', { item: 'resource' })}
          icon={<FileText className="h-6 w-6" />}
        />
        
        <Card className="mt-6">
          <CardContent className="py-6 text-center">
            <p className="text-muted-foreground mb-4">
              {t('common.errorDesc', { item: 'resource' })}
            </p>
            <Button variant="outline" asChild>
              <Link href={`/students/classes/${classId}/subjects/${subjectId}/chapters/${chapterId}/topics/${topicId}`}>
                {t('common.return', { destination: 'topic' })}
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  // Destructure resource data
  const { resource } = resourceItem;
  
  // Function to render resource content based on type
  const renderResourceContent = () => {
    switch (resource.resource_type) {
      case 'PDFResource':
        return (
          <div className="mt-6">
            <PDFDisplay 
              pdfUrl={(resource as PDFResourceType).pdf_url || (resource as PDFResourceType).pdf_file} 
            />
          </div>
        );
        
      case 'VideoResource':
        return (
          <div className="mt-6">
            <VideoReader 
              videoUrl={(resource as VideoResourceType).video_url || (resource as VideoResourceType).video_file} 
            />
          </div>
        );
        
      case 'ExerciseResource':
        return (
          <div className="mt-6 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <PenTool className="h-5 w-5 mr-2" />
                  {t('student.resource.exerciseInstructions')}
                </CardTitle>
              </CardHeader>
              <CardContent className="prose max-w-none">
                <p>{(resource as ExerciseResourceType).instructions}</p>
                
                {(resource as ExerciseResourceType).exercise_url && (
                  <div className="mt-4">
                    <h4>{t('student.resource.exerciseFile')}</h4>
                    <Button asChild>
                      <a 
                        href={(resource as ExerciseResourceType).exercise_url || (resource as ExerciseResourceType).exercise_file} 
                        target="_blank" 
                        rel="noopener noreferrer"
                      >
                        <FileText className="h-4 w-4 mr-2" />
                        {t('student.resource.downloadExercise')}
                      </a>
                    </Button>
                  </div>
                )}
                
                {(resource as ExerciseResourceType).solution_url && (
                  <div className="mt-4">
                    <h4>{t('student.resource.solution')}</h4>
                    <Button variant="outline" asChild>
                      <a 
                        href={(resource as ExerciseResourceType).solution_url || (resource as ExerciseResourceType).solution_file} 
                        target="_blank" 
                        rel="noopener noreferrer"
                      >
                        <FileText className="h-4 w-4 mr-2" />
                        {t('student.resource.viewSolution')}
                      </a>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        );
        
      case 'RevisionResource':
        return (
          <div className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BookOpen className="h-5 w-5 mr-2" />
                  {t('student.resource.revisionNotes')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div 
                  className="prose max-w-none"
                  dangerouslySetInnerHTML={{ __html: (resource as RevisionResourceType).content }}
                />
              </CardContent>
            </Card>
          </div>
        );
        
      default:
        return (
          <div className="mt-6">
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-muted-foreground">
                  {t('student.resource.unsupportedType')}
                </p>
              </CardContent>
            </Card>
          </div>
        );
    }
  };

  return (
    <div className="container mx-auto py-6">
      <Button variant="ghost" size="sm" asChild className="mb-4">
        <Link href={`/students/classes/${classId}/subjects/${subjectId}/chapters/${chapterId}/topics/${topicId}`}>
          <ArrowLeft className="h-4 w-4 mr-1" />
          {t('student.resource.backToTopic')}
        </Link>
      </Button>

      <DashboardHeader
        title={resource.title}
        description={resource.description || t('student.resource.resourceFor', { title: topic.title })}
        icon={
          resource.resource_type === 'PDFResource' ? <FileText className="h-6 w-6" /> :
          resource.resource_type === 'VideoResource' ? <Film className="h-6 w-6" /> :
          resource.resource_type === 'ExerciseResource' ? <PenTool className="h-6 w-6" /> :
          <BookOpen className="h-6 w-6" />
        }
      />
      
      {renderResourceContent()}
    </div>
  );
}

export default ResourceDetailPage;