"use client";

import { getClassRessources } from '@/actions/courses';
import { getMyClass } from '@/actions/user-classes';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AbstractResourceType, PDFResourceType, ExerciseResourceType, RevisionResourceType } from '@/types';
import { ArrowLeft, BookOpen, FileText, GraduationCap, ScrollText, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import React, { useState, useEffect } from 'react';
import { useI18n } from "@/locales/client";
import { useQuery } from '@tanstack/react-query';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';
import { useSubscriptionStore } from '@/store/subscriptionStore';
import { motion } from "framer-motion";

// Define a type for the nested resource structure
interface ResourceResponse {
  id: number;
  resource: AbstractResourceType | PDFResourceType | ExerciseResourceType | RevisionResourceType;
}

// Animation variants
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

function MyCourses() {
  const router = useRouter();
  const { isLoading, hasActiveSubscription } = useSubscriptionStore();

  useEffect(() => {
    // If subscription info is loaded and there is no active subscription,
    // redirect the user to subscriptions page.
    if (!isLoading && hasActiveSubscription === false) {
      router.push('/students/subscriptions');
    }
  }, [isLoading, hasActiveSubscription, router]);

  const t = useI18n();
  const [selectedClass, setSelectedClass] = useState<string>("");
  const [activeTab, setActiveTab] = useState<string>("all");
  const [processedResources, setProcessedResources] = useState<AbstractResourceType[]>([]);
  
  // Fetch classes
  const { data: myClasses, isLoading: classesLoading } = useQuery({
    queryKey: ['myClasses'],
    queryFn: () => getMyClass(),
  });
  
  // Fetch resources based on selected class
  const { data: resourcesResponse, isLoading: resourcesLoading, error } = useQuery({
    queryKey: ['classResources', selectedClass],
    queryFn: () => selectedClass ? getClassRessources(selectedClass) : Promise.resolve([]),
    enabled: !!selectedClass,
  });
  
  // Process the nested resources when data is fetched
  useEffect(() => {
    if (resourcesResponse) {
      // Check if the response has the nested structure
      const resources = resourcesResponse.map((item: ResourceResponse | AbstractResourceType) => {
        if (item && 'resource' in item) {
          // Return the inner resource but preserve the outer ID
          return {
            ...item.resource,
            id: item.id // Keep the outer ID for reference
          };
        }
        // If it's already in the expected format
        return item as AbstractResourceType;
      });
      setProcessedResources(resources);
    }
  }, [resourcesResponse]);

  const handleClassChange = (value: string) => {
    setSelectedClass(value);
  };

  // Filter resources by type
  const filteredResources = processedResources ? 
    (activeTab === "all" 
      ? processedResources 
      : processedResources.filter((resource) => {
          // Check if the resource_type property exists and contains the active tab value
          return resource?.resource_type?.toLowerCase().includes(activeTab.toLowerCase());
        })
    ) : [];
  
  // Function to get the appropriate icon based on resource type
  const getResourceIcon = (resourceType?: string) => {
    switch (resourceType) {
      case 'PDFResource':
        return <FileText className="h-10 w-10 text-red-500" />;
      case 'ExerciseResource':
        return <ScrollText className="h-10 w-10 text-green-500" />;
      case 'RevisionResource':
        return <GraduationCap className="h-10 w-10 text-blue-500" />;
      default:
        return <BookOpen className="h-10 w-10 text-primary" />;
    }
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
                  <Skeleton className="h-10 w-10 rounded-md mb-2" />
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
            <BookOpen className="h-7 w-7 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
              {t('student.dashboard.myCourses')}
            </h1>
            <p className="text-sm text-gray-600">{t('student.myCourses.description')}</p>
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
            <GraduationCap className="mr-2 h-5 w-5 text-primary" />
            {t('student.myCourses.selectClass')}
          </h3>
          <Select onValueChange={handleClassChange} value={selectedClass}>
            <SelectTrigger className="w-full sm:w-[300px] border-primary/20 focus:ring-primary/20">
              <SelectValue placeholder={t('student.myCourses.selectClassPlaceholder')} />
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
                  {t('student.myCourses.noClassesAvailable')}
                </SelectItem>
              )}
            </SelectContent>
          </Select>
        </motion.div>

        {/* Resource type tabs */}
        {selectedClass && (
          <motion.div variants={sectionVariants}>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
              <TabsList className="grid w-full grid-cols-4 bg-primary/10 text-primary">
                <TabsTrigger value="all">{t('student.resource.allResources')}</TabsTrigger>
                <TabsTrigger value="pdf">{t('student.resource.pdfs')}</TabsTrigger>
                <TabsTrigger value="exercise">{t('student.resource.exercises')}</TabsTrigger>
                <TabsTrigger value="revision">{t('student.resource.revisions')}</TabsTrigger>
              </TabsList>
            </Tabs>
          </motion.div>
        )}

        {/* Resources display */}
        {!selectedClass ? (
          <motion.div 
            variants={sectionVariants} 
            className="text-center py-12 border rounded-lg shadow-lg border-primary/20 bg-card/95 backdrop-blur"
          >
            <div className="bg-primary/10 p-3 rounded-full mx-auto mb-4 w-14 h-14 flex items-center justify-center">
              <BookOpen className="h-7 w-7 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Select a Class</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              Please select a class to view available course materials
            </p>
          </motion.div>
        ) : resourcesLoading ? (
          <motion.div variants={sectionVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="opacity-60 shadow-md border-primary/20 overflow-hidden bg-card/95 backdrop-blur">
                <CardHeader>
                  <Skeleton className="h-10 w-10 rounded-md mb-2" />
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
                  {t('common.errorDesc', { item: 'resources' })}
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
        ) : filteredResources && filteredResources.length > 0 ? (
          <motion.div variants={sectionVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredResources.map((resource, index) => (
              <motion.div
                key={resource?.id}
                variants={fadeInVariants}
                custom={index}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="shadow-lg border-primary/20 overflow-hidden bg-card/95 backdrop-blur relative group animate-slideUp hover:shadow-xl transition-all duration-300" 
                      style={{ animationDelay: `${index * 100}ms` }}>
                  <div className="absolute top-0 right-0 w-[80px] h-[80px] bg-primary/20 rounded-bl-full z-0 opacity-20"></div>
                  <CardHeader>
                    <div className="flex items-center gap-4">
                      {getResourceIcon(resource?.resource_type)}
                      <CardTitle className="line-clamp-2">{resource?.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="relative z-10">
                    {resource?.description && (
                      <p className="text-sm text-muted-foreground line-clamp-3">
                        {resource.description}
                      </p>
                    )}
                    <div className="mt-2">
                      <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                        {resource?.resource_type ? resource.resource_type.replace('Resource', '') : 'Resource'}
                      </span>
                      {resource?.created_at && (
                        <span className="text-xs text-muted-foreground ml-2">
                          {format(new Date(resource.created_at), 'MMM d, yyyy')}
                        </span>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-end relative z-10">
                    <Button asChild size="sm" className="bg-primary hover:bg-primary/90 transition-all group">
                      <Link href={`/students/resource/${resource?.id}`}>
                        {t('resources.tooltips.view')}
                        <ArrowRight className="ml-2 h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </Button>
                  </CardFooter>
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
              <ScrollText className="h-7 w-7 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">{t('resources.empty')}</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              {activeTab !== 'all' 
                ? t('student.topic.noResources').replace('leçon', activeTab)
                : t('student.topic.noResources')
              }
            </p>
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
}

export default MyCourses;
