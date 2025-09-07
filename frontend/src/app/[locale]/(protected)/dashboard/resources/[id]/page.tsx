"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, FileText, Video, BookOpen, ScrollText, File } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { getResourceFromId } from '@/actions/resources';
import { PDFResourceType, VideoResourceType, RevisionResourceType, ExerciseResourceType } from '@/types';
import PDFDisplay from '@/components/PDFDisplay';
import VideoReader from '@/components/VideoReader';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import ScreenshotProtectionProvider from '@/providers/ScreenshotProtectionProvider';

export default function ResourceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const resourceId = params.id as string;

  const { data: resource, isLoading, error } = useQuery({
    queryKey: ['resource', resourceId],
    queryFn: () => getResourceFromId(resourceId),
  });

  // Get resource icon based on type
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
          return <PDFDisplay pdfUrl={proxiedUrl} />;
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
          return <VideoReader videoUrl={proxiedVideoUrl} />;
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
            <h3 className="text-lg font-semibold mb-4">Exercise Instructions</h3>
            <div className="bg-gray-50 p-4 rounded-md mb-6">
              <p>{exerciseResource.instructions}</p>
            </div>

            {exerciseResource.exercise_url && (
              <div className="flex space-x-4">
                <Button asChild variant="outline">
                  <a href={exerciseResource.exercise_url} target="_blank" rel="noopener noreferrer">
                    View Exercise
                  </a>
                </Button>

                {exerciseResource.solution_url && (
                  <Button asChild variant="outline">
                    <a href={exerciseResource.solution_url} target="_blank" rel="noopener noreferrer">
                      View Solution
                    </a>
                  </Button>
                )}
              </div>
            )}
          </div>
        );

      case 'RevisionResource':
        const revisionResource = resource as RevisionResourceType;
        return (
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4">Revision Notes</h3>
            <div className="bg-gray-50 p-4 rounded-md">
              <div
                className="prose max-w-none"
                dangerouslySetInnerHTML={{ __html: revisionResource.content }}
              />
            </div>
          </div>
        );

      default:
        return (
          <div className="text-center p-8">
            <p className="text-muted-foreground">This resource type is not supported.</p>
          </div>
        );
    }
  };

  if (isLoading) {
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

  if (error || !resource) {
    return (
      <div className="container mx-auto py-6">
        <Button variant="ghost" size="sm" onClick={() => router.back()} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back
        </Button>
        <div className="text-center p-8">
          <h2 className="text-xl font-semibold mb-4">Resource Not Found</h2>
          <p className="text-muted-foreground mb-4">
            The resource you're looking for could not be found or you don't have permission to view it.
          </p>
          <Button onClick={() => router.back()}>Go Back</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <Button variant="outline" size="sm" onClick={() => router.back()} className="mb-6">
        <ArrowLeft className="h-4 w-4 mr-1" />
        Back to Resources
      </Button>

      <div className="flex items-center gap-4 mb-6">
        {getResourceIcon()}
        <div>
          <h1 className="text-2xl font-bold">{resource.title}</h1>
          {resource.created_at && (
            <p className="text-sm text-muted-foreground">
              {format(new Date(resource.created_at), 'MMM d, yyyy')}
            </p>
          )}
        </div>
      </div>

      {resource.description && (
        <div className="mb-6 bg-gray-50 p-4 rounded-md">
          <p className="text-muted-foreground">{resource.description}</p>
        </div>
      )}
      <ScreenshotProtectionProvider>

        <Card>
          <CardContent className="p-0">
            {renderResourceViewer()}
          </CardContent>
        </Card>
      </ScreenshotProtectionProvider>
    </div>
  );
}
