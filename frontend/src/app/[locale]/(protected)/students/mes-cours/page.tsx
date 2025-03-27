"use client";

import { getClassRessources } from '@/actions/courses';
import { getMyClass } from '@/actions/user-classes';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AbstractResourceType, PDFResourceType, ExerciseResourceType, RevisionResourceType } from '@/types';
import { ArrowLeft, BookOpen, FileText, GraduationCap, ScrollText } from 'lucide-react';
import Link from 'next/link';
import React, { useState, useEffect } from 'react';
import { useI18n } from "@/locales/client";
import { useQuery } from '@tanstack/react-query';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';

// Define a type for the nested resource structure
interface ResourceResponse {
  id: number;
  resource: AbstractResourceType | PDFResourceType | ExerciseResourceType | RevisionResourceType;
}

function MyCourses() {
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
        title={t('student.dashboard.myCourses')}
        description="Access all your course materials"
        icon={<BookOpen className="h-6 w-6" />}
        showNavigation={true}
        currentPath={t('student.dashboard.myCourses')}
      />
      
      <Button variant="outline" size="sm" asChild className="mb-6">
        <Link href="/students">
          <ArrowLeft className="h-4 w-4 mr-1" />
          {t('common.back')} {t('common.dashboard')}
        </Link>
      </Button>

      {/* Class selector */}
      <div className="mb-6">
        <h3 className="text-lg font-medium mb-2">Select a class to view course materials:</h3>
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

      {/* Resource type tabs */}
      {selectedClass && (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList>
            <TabsTrigger value="all">All Resources</TabsTrigger>
            <TabsTrigger value="pdf">PDFs</TabsTrigger>
            <TabsTrigger value="exercise">Exercises</TabsTrigger>
            <TabsTrigger value="revision">Revisions</TabsTrigger>
          </TabsList>
        </Tabs>
      )}

      {/* Resources display */}
      {!selectedClass ? (
        <div className="text-center py-12 border rounded-lg">
          <h3 className="text-xl font-semibold mb-2">Select a Class</h3>
          <p className="text-muted-foreground">
            Please select a class to view available course materials
          </p>
        </div>
      ) : resourcesLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="opacity-60">
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
      ) : error ? (
        <Card className="mt-6">
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground mb-4">
              {t('common.errorDesc', { item: 'resources' })}
            </p>
            <div className="flex justify-center">
              <Button onClick={() => window.location.reload()}>
                {t('plans.retry')}
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : filteredResources && filteredResources.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredResources.map((resource) => (
            <Card key={resource?.id} className="overflow-hidden">
              <CardHeader>
                <div className="flex items-center gap-4">
                  {getResourceIcon(resource?.resource_type)}
                  <CardTitle className="line-clamp-2">{resource?.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                {resource?.description && (
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {resource.description}
                  </p>
                )}
                <div className="mt-2">
                  <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                    {resource?.resource_type ? resource.resource_type.replace('Resource', '') : 'Resource'}
                  </span>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                {resource?.created_at && (
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(resource.created_at), 'MMM d, yyyy')}
                  </p>
                )}
                <Button asChild size="sm">
                  <Link href={`/students/resource/${resource?.id}`}>
                    {t('resources.tooltips.view')}
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 border rounded-lg">
          <h3 className="text-xl font-semibold mb-2">{t('resources.empty')}</h3>
          <p className="text-muted-foreground">
            {activeTab !== 'all' 
              ? t('student.topic.noResources').replace('leçon', activeTab)
              : t('student.topic.noResources')
            }
          </p>
        </div>
      )}
    </div>
  );
}

export default MyCourses;
