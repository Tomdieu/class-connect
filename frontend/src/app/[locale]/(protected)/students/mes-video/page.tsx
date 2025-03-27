"use client";

import { getClassVideoResources } from '@/actions/courses';
import { getMyClass } from '@/actions/user-classes';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Play, Video } from 'lucide-react';
import Link from 'next/link';
import React, { useState, useEffect } from 'react';
import { useI18n } from "@/locales/client";
import { useQuery } from '@tanstack/react-query';
import { Skeleton } from '@/components/ui/skeleton';
import { VideoResourceType } from '@/types';
import { format } from 'date-fns';

// Define a type for the nested video resource structure
interface VideoResponse {
  id: number;
  resource: VideoResourceType;
}

function MyVideosPage() {
  const t = useI18n();
  const [selectedClass, setSelectedClass] = useState<string>("");
  const [processedVideos, setProcessedVideos] = useState<VideoResourceType[]>([]);
  
  // Fetch classes
  const { data: myClasses, isLoading: classesLoading } = useQuery({
    queryKey: ['myClasses'],
    queryFn: () => getMyClass(),
  });
  
  // Fetch videos based on selected class
  const { data: videosResponse, isLoading: videosLoading, error } = useQuery({
    queryKey: ['classVideos', selectedClass],
    queryFn: () => selectedClass ? getClassVideoResources(selectedClass) : Promise.resolve([]),
    enabled: !!selectedClass,
  });

  // Process the nested videos when data is fetched
  useEffect(() => {
    if (videosResponse) {
      // Process depending on the response structure
      const videos = videosResponse.map((item: VideoResponse | VideoResourceType) => {
        if (item && 'resource' in item) {
          // Return the inner resource but preserve the outer ID
          return {
            ...item.resource,
            id: item.id // Keep the outer ID for reference
          };
        }
        // If it's already in the expected format
        return item as VideoResourceType;
      });
      setProcessedVideos(videos);
    }
  }, [videosResponse]);
  
  const handleClassChange = (value: string) => {
    setSelectedClass(value);
  };
  
  // Extract unique classes to prevent duplicates
  const uniqueClasses = myClasses ? Array.from(
    new Map(myClasses.map(item => [item.id, item])).values()
  ) : [];
  
  if (classesLoading) {
    return (
      <div className="container mx-auto py-6">
        <Skeleton className="h-10 w-40 mb-4" />
        <Skeleton className="h-12 w-2/3 mb-2" />
        <Skeleton className="h-4 w-1/2 mb-8" />
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-6">
      <DashboardHeader
        title={t('student.dashboard.myVideos')}
        description="Access all your educational videos"
        icon={<Video className="h-6 w-6" />}
        showNavigation={true}
        currentPath={t('student.dashboard.myVideos')}
      />
      
      <Button variant="outline" size="sm" asChild className="mb-6">
        <Link href="/students">
          <ArrowLeft className="h-4 w-4 mr-1" />
          {t('common.back')} {t('common.dashboard')}
        </Link>
      </Button>

      {/* Class selector */}
      <div className="mb-6">
        <h3 className="text-lg font-medium mb-2">Select a class to view videos:</h3>
        <Select onValueChange={handleClassChange} value={selectedClass}>
          <SelectTrigger className="w-full sm:w-[300px]">
            <SelectValue placeholder="Select a class" />
          </SelectTrigger>
          <SelectContent>
            {uniqueClasses && uniqueClasses.length > 0 ? (
              uniqueClasses.map((classItem) => (
                <SelectItem key={classItem.id} value={classItem.id.toString()}>
                  {classItem.class_level.name} - {classItem.school_year.formatted_year}
                </SelectItem>
              ))
            ) : (
              <SelectItem value="no-class" disabled>
                No classes available
              </SelectItem>
            )}
          </SelectContent>
        </Select>
      </div>

      {/* Videos display */}
      {!selectedClass ? (
        <div className="text-center py-12 border rounded-lg">
          <h3 className="text-xl font-semibold mb-2">Select a Class</h3>
          <p className="text-muted-foreground">
            Please select a class to view available videos
          </p>
        </div>
      ) : videosLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="opacity-60">
              <CardHeader>
                <Skeleton className="h-40 rounded-md mb-2" />
                <Skeleton className="h-6 w-36 mb-2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-48 mb-4" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : error ? (
        <Card className="mt-6">
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground mb-4">
              {t('common.errorDesc', { item: 'videos' })}
            </p>
            <div className="flex justify-center">
              <Button onClick={() => window.location.reload()}>
                {t('plans.retry')}
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : processedVideos && processedVideos.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {processedVideos.map((video) => (
            <Card key={video?.id} className="overflow-hidden">
              <div className="relative h-48 bg-gray-100 flex items-center justify-center">
                <div className="absolute inset-0 flex items-center justify-center">
                  <Play className="h-16 w-16 text-white bg-primary/80 p-4 rounded-full" />
                </div>
                {/* If you have a thumbnail, you can use it here */}
                <div className="w-full h-full flex items-center justify-center bg-gray-800 text-white">
                  {video?.title || "Video"}
                </div>
              </div>
              <CardHeader>
                <CardTitle className="line-clamp-2">{video?.title}</CardTitle>
              </CardHeader>
              <CardContent>
                {video?.description && (
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {video.description}
                  </p>
                )}
              </CardContent>
              <CardFooter className="flex justify-between">
                {video?.created_at && (
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(video.created_at), 'MMM d, yyyy')}
                  </p>
                )}
                <Button asChild size="sm">
                  <a 
                    href={video?.video_url} 
                    target="_blank" 
                    rel="noreferrer"
                  >
                    Watch Video
                  </a>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 border rounded-lg">
          <h3 className="text-xl font-semibold mb-2">No Videos Available</h3>
          <p className="text-muted-foreground">
            There are no videos available for this class yet.
          </p>
        </div>
      )}
    </div>
  );
}

export default MyVideosPage;
