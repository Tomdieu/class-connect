"use client";

import { useState, useEffect } from "react";
import { useI18n } from "@/locales/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Video, Plus, Calendar, LoaderCircle, RefreshCcw } from "lucide-react";
import { OnlineCourseType } from "@/types";
import { listOnlineCourses } from "@/actions/online-courses";
import { useQuery } from "@tanstack/react-query";
import OnlineMeetingCard from "./OnlineMeetingCard";
import CreateOnlineCourseModal from "./CreateOnlineCourseModal";
import { toast } from "sonner";
import { format } from "date-fns";

// Skeleton loader for cards
const CardSkeleton = () => (
  <div className="rounded-lg border border-primary/20 shadow bg-card/95 backdrop-blur p-4 animate-pulse">
    <div className="h-6 w-3/4 bg-primary/10 rounded mb-6"></div>
    <div className="space-y-2">
      <div className="h-4 bg-primary/10 rounded w-full"></div>
      <div className="h-4 bg-primary/10 rounded w-5/6"></div>
      <div className="h-4 bg-primary/10 rounded w-4/6"></div>
    </div>
    <div className="mt-6 flex items-center justify-between">
      <div className="h-8 bg-primary/10 rounded w-20"></div>
      <div className="h-8 bg-primary/10 rounded w-20"></div>
    </div>
  </div>
);

export default function OnlineMeetingsPageClient() {
  const t = useI18n();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("upcoming");

  // Fix the query to always return an array, never undefined
  const { data, isLoading, error, refetch, isRefetching } = useQuery({
    queryKey: ["onlineCourses"],
    queryFn: async () => {
      try {
        const response = await listOnlineCourses();
        // Ensure we always return an array
        return response || [];
      } catch (error) {
        console.error("Error fetching online courses:", error);
        // Return empty array on error to avoid undefined
        return [];
      }
    },
  });
  
  // Ensure onlineCourses is always an array
  const onlineCourses = data || [];
  
  const now = new Date();
  
  // Filter courses based on start time
  const upcomingCourses = onlineCourses.filter(
    course => new Date(course.start_time) > now && course.status !== "CANCELLED"
  );
  
  const pastCourses = onlineCourses.filter(
    course => new Date(course.start_time) < now || course.status === "COMPLETED" || course.status === "CANCELLED"
  );

  const handleCreateSuccess = () => {
    toast.success(t("onlineMeetings.createSuccess"));
    refetch();
    setIsCreateModalOpen(false);
  };

  const handleCreateError = () => {
    toast.error(t("onlineMeetings.createError"));
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-primary/5 via-background to-background px-4 py-6 md:px-6 md:py-8">
      <div className="container mx-auto">
        <div className="relative mb-8">
          <div className="absolute top-0 right-0 w-[150px] h-[150px] bg-primary/30 rounded-bl-full z-0 opacity-20 hidden md:block"></div>
          
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 relative z-10">
            <div>
              <div className="flex items-center gap-2">
                <div className="rounded-full bg-primary/10 p-2">
                  <Video className="h-5 w-5 text-primary" />
                </div>
                <h2 className="text-xl md:text-2xl font-semibold text-primary">{t("onlineMeetings.title")}</h2>
              </div>
              <p className="text-muted-foreground mt-2">{t("onlineMeetings.description")}</p>
            </div>
            
            <Button 
              onClick={() => setIsCreateModalOpen(true)}
              className="bg-primary hover:bg-primary/90 text-white flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              {t("onlineMeetings.createNew")}
            </Button>
          </div>

          <Tabs defaultValue="upcoming" className="w-full" onValueChange={setActiveTab}>
            <TabsList className="mb-6 bg-card/95 backdrop-blur border border-primary/20">
              <TabsTrigger 
                value="upcoming" 
                className="data-[state=active]:bg-primary data-[state=active]:text-white flex items-center gap-2"
              >
                <Calendar className="h-4 w-4" />
                {t("onlineMeetings.upcoming")}
              </TabsTrigger>
              <TabsTrigger 
                value="past"
                className="data-[state=active]:bg-primary data-[state=active]:text-white"
              >
                {t("onlineMeetings.past")}
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="upcoming">
              {isLoading || isRefetching ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[1, 2, 3].map((index) => (
                    <CardSkeleton key={index} />
                  ))}
                </div>
              ) : error ? (
                <Card className="w-full bg-card/95 backdrop-blur border border-destructive/20">
                  <CardContent className="py-10">
                    <div className="text-center">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-4 text-destructive">
                        <circle cx="12" cy="12" r="10" />
                        <line x1="12" y1="8" x2="12" y2="12" />
                        <line x1="12" y1="16" x2="12.01" y2="16" />
                      </svg>
                      <p className="text-destructive mb-4">{t("onlineMeetings.errorLoading")}</p>
                      <Button 
                        onClick={() => refetch()}
                        variant="outline"
                        className="border-primary/20 hover:bg-primary/5"
                      >
                        <RefreshCcw className="mr-2 h-4 w-4" />
                        {t("common.retry")}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : upcomingCourses.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {upcomingCourses.map((course) => (
                    <OnlineMeetingCard 
                      key={course.id} 
                      course={course} 
                      onRefresh={refetch} 
                    />
                  ))}
                </div>
              ) : (
                <Card className="w-full bg-card/95 backdrop-blur border border-primary/20 shadow-md relative overflow-hidden">
                  <div className="absolute bottom-0 left-0 w-[100px] h-[100px] bg-primary/20 rounded-tr-full z-0 opacity-20"></div>
                  <CardContent className="py-10 relative z-10">
                    <div className="text-center">
                      <div className="mx-auto mb-4 rounded-full bg-primary/10 p-3 w-16 h-16 flex items-center justify-center">
                        <Calendar className="h-8 w-8 text-primary" />
                      </div>
                      <h3 className="text-lg font-medium mb-2 text-primary">{t("onlineMeetings.noUpcoming")}</h3>
                      <p className="text-muted-foreground">{t("onlineMeetings.createFirst")}</p>
                      <Button 
                        onClick={() => setIsCreateModalOpen(true)}
                        className="mt-4 bg-primary hover:bg-primary/90 text-white"
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        {t("onlineMeetings.createNew")}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
            
            <TabsContent value="past">
              {isLoading || isRefetching ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[1, 2, 3].map((index) => (
                    <CardSkeleton key={index} />
                  ))}
                </div>
              ) : error ? (
                <Card className="w-full bg-card/95 backdrop-blur border border-destructive/20">
                  <CardContent className="py-10">
                    <div className="text-center">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-4 text-destructive">
                        <circle cx="12" cy="12" r="10" />
                        <line x1="12" y1="8" x2="12" y2="12" />
                        <line x1="12" y1="16" x2="12.01" y2="16" />
                      </svg>
                      <p className="text-destructive mb-4">{t("onlineMeetings.errorLoading")}</p>
                      <Button 
                        onClick={() => refetch()}
                        variant="outline"
                        className="border-primary/20 hover:bg-primary/5"
                      >
                        <RefreshCcw className="mr-2 h-4 w-4" />
                        {t("common.retry")}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : pastCourses.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {pastCourses.map((course) => (
                    <OnlineMeetingCard 
                      key={course.id} 
                      course={course} 
                      isPast={true}
                      onRefresh={refetch} 
                    />
                  ))}
                </div>
              ) : (
                <Card className="w-full bg-card/95 backdrop-blur border border-primary/20 shadow-md">
                  <CardContent className="py-10">
                    <div className="text-center">
                      <div className="mx-auto mb-4 rounded-full bg-primary/10 p-3 w-16 h-16 flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8 text-primary">
                          <rect x="2" y="4" width="20" height="16" rx="2" />
                          <path d="m10 16 5-6" />
                          <path d="M7 16h.01" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-medium mb-2 text-primary">{t("onlineMeetings.noPast")}</h3>
                      <p className="text-muted-foreground">{t("onlineMeetings.pastMeetingsShow")}</p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
      
      <CreateOnlineCourseModal 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)} 
        onSuccess={handleCreateSuccess}
        onError={handleCreateError}
      />
    </div>
  );
}
