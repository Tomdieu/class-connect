"use client";

import { getResourceFromId } from '@/actions/resources';
import { getUserProgress, updateUserProgress } from '@/actions/user-progress';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import PDFDisplay from '@/components/PDFDisplay';
import VideoReader from '@/components/VideoReader';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, BookOpen, File, FileText, ScrollText, Video } from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import React, { useState, useEffect } from 'react';
import { useI18n } from '@/locales/client';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { PDFResourceType, VideoResourceType, ExerciseResourceType, RevisionResourceType } from '@/types';
import { toast } from 'sonner';
import { useSubscriptionStore } from '@/store/subscriptionStore';

export default function ResourceView() {
  const t = useI18n();
  const params = useParams<{resourceId:string}>();
  const router = useRouter();
  const resourceId = params?.resourceId as string;
  const [isProgressTracking, setIsProgressTracking] = useState<boolean>(false);
  const { isLoading, hasActiveSubscription } = useSubscriptionStore();

  useEffect(() => {
    if (!isLoading && hasActiveSubscription === false) {
      router.push('/students/subscriptions');
    }
  }, [isLoading, hasActiveSubscription, router]);

  // Fetch resource data
  const { data: resource, isLoading: resourceLoading, error: resourceError } = useQuery({
    queryKey: ['resource', resourceId],
    queryFn: () => getResourceFromId(resourceId),
  });

  // Fetch user's progress for this resource
  const { data: progress, isLoading: progressLoading } = useQuery({
    queryKey: ['userProgress', resourceId],
    queryFn: () => getUserProgress(parseInt(resourceId)),
    enabled: !!resourceId,
  });

  // Mutation for updating progress
  const progressMutation = useMutation({
    mutationFn: updateUserProgress,
    onSuccess: () => {
      setIsProgressTracking(false);
    },
    onError: (error) => {
      console.error("Failed to update progress:", error);
      setIsProgressTracking(false);
    }
  });

  // Handle PDF progress updates
  const handlePDFProgress = (currentPage: number, totalPages: number, progressPercentage: number) => {
    if (isProgressTracking || !resource) return; // Avoid multiple simultaneous requests
    
    setIsProgressTracking(true);
    progressMutation.mutate({
      resource_id: parseInt(resourceId),
      topic_id: resource.topic,
      progress_percentage: progressPercentage,
      completed: progressPercentage >= 100,
      current_page: currentPage,
      total_pages: totalPages
    });
  };

  // Handle video progress updates
  const handleVideoProgress = (currentTime: number, duration: number, progressPercentage: number) => {
    if (isProgressTracking || !resource) return; // Avoid multiple simultaneous requests
    
    setIsProgressTracking(true);
    progressMutation.mutate({
      resource_id: parseInt(resourceId),
      topic_id: resource.topic,
      progress_percentage: progressPercentage,
      completed: progressPercentage >= 98, // Consider complete at 98% to account for video ending mechanics
      current_time: Math.floor(currentTime),
      total_duration: Math.floor(duration)
    });
  };

  // Function to get the appropriate icon based on resource type
  const getResourceIcon = () => {
    if (!resource) return <File className="h-8 w-8 text-gray-400" />;
    
    switch (resource.resource_type) {
      case 'PDFResource':
        return <FileText className="h-8 w-8 text-red-500" />;
      case 'VideoResource':
        return <Video className="h-8 w-8 text-blue-500" />;
      case 'ExerciseResource':
        return <ScrollText className="h-8 w-8 text-green-500" />;
      case 'RevisionResource':
        return <BookOpen className="h-8 w-8 text-purple-500" />;
      default:
        return <File className="h-8 w-8 text-gray-400" />;
    }
  };

  // Function to render the appropriate resource viewer
  const renderResourceViewer = () => {
    if (!resource) return null;

    switch (resource.resource_type) {
      case 'PDFResource':
        const pdfResource = resource as PDFResourceType;
        if (pdfResource.pdf_url) {
          // Use proxy API to avoid CORS issues with S3
          const proxiedUrl = `/api/proxy-pdf?url=${encodeURIComponent(pdfResource.pdf_url)}`;
          return (
            <PDFDisplay 
              pdfUrl={proxiedUrl} 
              onProgressUpdate={handlePDFProgress}
              initialPage={progress?.current_page || 0}
            />
          );
        } else {
          return (
            <div className="text-center p-8">
              <p className="text-muted-foreground">PDF file is not available.</p>
            </div>
          );
        }

      case 'VideoResource':
        const videoResource = resource as VideoResourceType;
        if (videoResource.video_url) {
          // Use proxy API to avoid CORS and CSP issues with S3
          const proxiedVideoUrl = `/api/proxy-video?url=${encodeURIComponent(videoResource.video_url)}`;
          return (
            <VideoReader 
              videoUrl={proxiedVideoUrl}
              onProgressUpdate={handleVideoProgress}
              initialTime={progress?.current_time || 0}
            />
          );
        } else {
          return (
            <div className="text-center p-8">
              <p className="text-muted-foreground">Video file is not available.</p>
            </div>
          );
        }

      case 'ExerciseResource':
        const exerciseResource = resource as ExerciseResourceType;
        return (
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4">{t('student.resource.exerciseInstructions')}</h3>
            <div className="bg-gray-50 p-4 rounded-md mb-6">
              <p>{exerciseResource.instructions}</p>
            </div>
            
            <div className="mb-6">
              <h4 className="font-medium mb-2">{t('student.resource.exerciseFile')}</h4>
              <Button asChild>
                <a href={exerciseResource.exercise_url} target="_blank" download>
                  {t('student.resource.downloadExercise')}
                </a>
              </Button>
            </div>
            
            {exerciseResource.solution_url && (
              <div>
                <h4 className="font-medium mb-2">{t('student.resource.solution')}</h4>
                <Button asChild variant="outline">
                  <a href={exerciseResource.solution_url} target="_blank" download>
                    {t('student.resource.viewSolution')}
                  </a>
                </Button>
              </div>
            )}
          </div>
        );

      case 'RevisionResource':
        const revisionResource = resource as RevisionResourceType;
        return (
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4">{t('student.resource.revisionNotes')}</h3>
            <div className="bg-gray-50 p-4 rounded-md">
              <div className="prose max-w-none"
                dangerouslySetInnerHTML={{ __html: revisionResource.content }}
              />
            </div>
          </div>
        );

      default:
        return (
          <div className="text-center p-8">
            <p className="text-muted-foreground">{t('student.resource.unsupportedType')}</p>
          </div>
        );
    }
  };

  if (resourceLoading || progressLoading) {
    return (
      <div className="container mx-auto py-6">
        <Skeleton className="h-10 w-40 mb-4" />
        <Skeleton className="h-12 w-2/3 mb-2" />
        <Skeleton className="h-4 w-1/2 mb-8" />
        <Card>
          <CardContent className="p-8">
            <Skeleton className="h-[500px] w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (resourceError || !resource) {
    return (
      <div className="container mx-auto py-6">
        <Button variant="ghost" size="sm" asChild className="mb-4">
          <Link href="/students">
            <ArrowLeft className="h-4 w-4 mr-1" />
            {t('common.back')} {t('common.dashboard')}
          </Link>
        </Button>
        <DashboardHeader
          title={t('resources.title')}
          description={t('common.error')}
          icon={<File className="h-6 w-6" />}
        />
        <Card className="mt-6">
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground mb-4">
              {t('common.errorDesc', { item: 'resource' })}
            </p>
            <div className="flex justify-center">
              <Button onClick={() => router.back()}>
                {t('common.back')}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div style={{ filter: (!isLoading && hasActiveSubscription === false) ? "blur(10px)" : "none" }}>
      <div className="container mx-auto py-6">
        <Button variant="outline" size="sm" asChild className="mb-6">
          <Link href="/students">
            <ArrowLeft className="h-4 w-4 mr-1" />
            {t('common.back')}
          </Link>
        </Button>
        
        {/* Display progress indicator if available */}
        {progress && (
          <div className="mb-4 flex items-center gap-2">
            <div className="w-full bg-gray-200 h-2 rounded-full">
              <div 
                className="bg-primary h-2 rounded-full transition-all duration-300" 
                style={{ width: `${progress.progress_percentage}%` }}
              />
            </div>
            <span className="text-xs text-muted-foreground whitespace-nowrap">
              {progress.progress_percentage}% {progress.completed ? t('resource.completed') : t('resource.inProgress')}
            </span>
          </div>
        )}
        
        {/* Continue reading/watching hint */}
        {progress && !progress.completed && (
          <div className="mb-4 text-sm text-muted-foreground bg-primary/5 p-2 rounded">
            {resource?.resource_type === 'PDFResource' && progress.current_page ?
              <span>{t('resource.continueReading', { page: progress.current_page })}</span>
              : resource?.resource_type === 'VideoResource' && progress.current_time ?
              <span>{t('resource.continueWatching', { time: new Date(progress.current_time * 1000).toISOString().substr(14, 5) })}</span>
              : null
            }
          </div>
        )}
        
        <div className="flex items-center gap-4 mb-6">
          {getResourceIcon()}
          <div>
            <h1 className="text-2xl font-bold">{resource?.title}</h1>
            {resource?.created_at && (
              <p className="text-sm text-muted-foreground">
                {format(new Date(resource.created_at), 'MMM d, yyyy')}
              </p>
            )}
          </div>
        </div>
        
        {resource?.description && (
          <div className="mb-6 bg-gray-50 p-4 rounded-md">
            <p className="text-muted-foreground">{resource.description}</p>
          </div>
        )}
        
        <Card>
          <CardContent className="p-0">
            {renderResourceViewer()}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
