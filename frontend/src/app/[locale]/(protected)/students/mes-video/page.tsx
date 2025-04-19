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
import { useRouter } from 'next/navigation';
import { useSubscriptionStore } from '@/store/subscriptionStore';
import { motion } from "framer-motion";

// Define a type for the nested video resource structure
interface VideoResponse {
  id: number;
  resource: VideoResourceType;
}

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

function MyVideosPage() {
  const router = useRouter();
  const { isLoading, hasActiveSubscription } = useSubscriptionStore();

  useEffect(() => {
    if (!isLoading && hasActiveSubscription === false) {
      router.push('/students/subscriptions');
    }
  }, [isLoading, hasActiveSubscription, router]);

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
      <motion.div 
        className="min-h-screen bg-gradient-to-b from-primary/5 via-background to-background p-4 sm:p-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="container mx-auto">
          <Skeleton className="h-12 w-2/3 mb-2" />
          <Skeleton className="h-4 w-1/2 mb-8" />
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="opacity-60 shadow-md border-primary/20 overflow-hidden bg-card/95 backdrop-blur">
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
            <Video className="h-7 w-7 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
              {t('student.dashboard.myVideos')}
            </h1>
            <p className="text-sm text-gray-600">{t('student.myVideos.description')}</p>
          </div>
        </div>
      </motion.div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="space-y-8 max-w-[2400px] mx-auto"
      >
        {/* Class selector */}
        <motion.div variants={sectionVariants} className="bg-card/95 backdrop-blur shadow-lg border border-primary/20 rounded-lg p-6">
          <h3 className="text-lg font-medium mb-4 flex items-center">
            <Video className="mr-2 h-5 w-5 text-primary" />
            {t('student.myVideos.selectClass')}
          </h3>
          <Select onValueChange={handleClassChange} value={selectedClass}>
            <SelectTrigger className="w-full sm:w-[300px] border-primary/20 focus:ring-primary/20">
              <SelectValue placeholder={t('student.myVideos.selectClassPlaceholder')} />
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
                  {t('student.myVideos.noClassesAvailable')}
                </SelectItem>
              )}
            </SelectContent>
          </Select>
        </motion.div>

        {/* Videos display */}
        {!selectedClass ? (
          <motion.div 
            variants={sectionVariants} 
            className="text-center py-12 border rounded-lg shadow-lg border-primary/20 bg-card/95 backdrop-blur"
          >
            <div className="bg-primary/10 p-3 rounded-full mx-auto mb-4 w-14 h-14 flex items-center justify-center">
              <Video className="h-7 w-7 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">{t('student.myVideos.noClassSelected')}</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              {t('student.myVideos.selectClassDesc')}
            </p>
          </motion.div>
        ) : videosLoading ? (
          <motion.div variants={sectionVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="opacity-60 shadow-md border-primary/20 overflow-hidden bg-card/95 backdrop-blur">
                <CardHeader>
                  <Skeleton className="h-40 rounded-md mb-2" />
                  <Skeleton className="h-6 w-36 mb-2" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-4 w-48 mb-4" />
                </CardContent>
              </Card>
            ))}
          </motion.div>
        ) : error ? (
          <motion.div variants={sectionVariants}>
            <Card className="shadow-lg border-primary/20 overflow-hidden bg-card/95 backdrop-blur">
              <CardContent className="pt-6">
                <p className="text-center text-muted-foreground mb-4">
                  {t('common.errorDesc', { item: 'videos' })}
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
        ) : processedVideos && processedVideos.length > 0 ? (
          <motion.div variants={sectionVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {processedVideos.map((video, index) => (
              <motion.div
                key={video?.id}
                variants={fadeInVariants}
                custom={index}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="shadow-lg border-primary/20 overflow-hidden bg-card/95 backdrop-blur relative group animate-slideUp hover:shadow-xl transition-all duration-300">
                  <div className="absolute top-0 right-0 w-[80px] h-[80px] bg-primary/20 rounded-bl-full z-0 opacity-20"></div>
                  {/* If you have a thumbnail, you can use it here */}
                  <div className="w-full h-full flex items-center justify-center bg-gray-800 text-white">
                    {video?.title || "Video"}
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Play className="h-16 w-16 text-white bg-primary/80 p-4 rounded-full" />
                  </div>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div 
            variants={sectionVariants} 
            className="text-center py-12 border rounded-lg shadow-lg border-primary/20 bg-card/95 backdrop-blur"
          >
            <div className="bg-primary/10 p-3 rounded-full mx-auto mb-4 w-14 h-14 flex items-center justify-center">
              <Video className="h-7 w-7 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">
              {t('student.myVideos.noVideosAvailableTitle')}
            </h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              {t('student.myVideos.noVideosAvailableDesc')}
            </p>
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
}

export default MyVideosPage;
