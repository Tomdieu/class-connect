"use client";

import { useState, useEffect } from "react";
import { useI18n } from "@/locales/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Video, Plus, Calendar } from "lucide-react";
import { OnlineCourseType } from "@/types";
import { listOnlineCourses } from "@/actions/online-courses";
import { useQuery } from "@tanstack/react-query";
import OnlineMeetingCard from "./OnlineMeetingCard";
import CreateOnlineCourseModal from "./CreateOnlineCourseModal";
import { toast } from "sonner";
import { format } from "date-fns";

export default function OnlineMeetingsPageClient() {
  const t = useI18n();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("upcoming");

  const { data: onlineCourses, isLoading, error, refetch } = useQuery({
    queryKey: ["onlineCourses"],
    queryFn: () => listOnlineCourses(),
  });

  const now = new Date();
  
  // Filter courses based on start time
  const upcomingCourses = onlineCourses?.filter(
    course => new Date(course.start_time) > now && course.status !== "CANCELLED"
  ) || [];
  
  const pastCourses = onlineCourses?.filter(
    course => new Date(course.start_time) < now || course.status === "COMPLETED" || course.status === "CANCELLED"
  ) || [];

  if (error) {
    return (
      <Card className="w-full">
        <CardContent className="py-10">
          <div className="text-center">
            <p className="text-destructive mb-4">Error loading meetings</p>
            <Button onClick={() => refetch()}>Retry</Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const handleCreateSuccess = () => {
    toast.success(t("onlineMeetings.createSuccess"));
    refetch();
    setIsCreateModalOpen(false);
  };

  const handleCreateError = () => {
    toast.error(t("onlineMeetings.createError"));
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <Video className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold">{t("onlineMeetings.title")}</h2>
        </div>
        <Button 
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          {t("onlineMeetings.createNew")}
        </Button>
      </div>

      <Tabs defaultValue="upcoming" className="w-full" onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="upcoming" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            {t("onlineMeetings.upcoming")}
          </TabsTrigger>
          <TabsTrigger value="past">
            {t("onlineMeetings.past")}
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="upcoming">
          {isLoading ? (
            <div className="w-full h-40 flex items-center justify-center">
              <p>{t("common.loading")}</p>
            </div>
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
            <Card className="w-full">
              <CardContent className="py-10">
                <div className="text-center">
                  <h3 className="text-lg font-medium mb-2">{t("onlineMeetings.noUpcoming")}</h3>
                  <p className="text-muted-foreground">{t("onlineMeetings.createFirst")}</p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="past">
          {isLoading ? (
            <div className="w-full h-40 flex items-center justify-center">
              <p>{t("common.loading")}</p>
            </div>
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
            <Card className="w-full">
              <CardContent className="py-10">
                <div className="text-center">
                  <h3 className="text-lg font-medium mb-2">{t("onlineMeetings.noPast")}</h3>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      <CreateOnlineCourseModal 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)} 
        onSuccess={handleCreateSuccess}
        onError={handleCreateError}
      />
    </div>
  );
}
