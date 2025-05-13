"use client";

import { getCourseOffering, createCourseOfferingAction, updateCourseOfferingAction, listCourseOfferingActions } from "@/actions/course-offerings";
import { getAvailabilityOfUser } from "@/actions/user-availability";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/locales/client";
import { ArrowLeft, CalendarIcon, Loader2, MapPin, UserCircle, Plus, Trash, Clock, Calendar, CheckCircle2, XCircle } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { UserType, CourseOfferingActionType, ActionStatus, DayOfWeek, TimeSlot } from "@/types";
import { toast } from "sonner";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";

const Checkbox = ({ checked, disabled = false }:{checked:boolean,disabled:boolean}) => (
  <div className={`flex items-center justify-center h-5 w-5 rounded border ${checked ? 'bg-primary border-primary' : 'bg-white border-gray-300'} ${disabled ? 'opacity-60' : 'opacity-100'}`}>
    {checked && (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3 text-white">
        <polyline points="20 6 9 17 4 12"></polyline>
      </svg>
    )}
  </div>
);

const TableSkeleton = () => (
  <div className="overflow-x-auto animate-pulse">
    <div className="min-w-full">
      <div className="bg-gray-200 h-12 w-full mb-1 rounded"></div>
      {Array(8).fill(0).map((_, i) => (
        <div key={i} className="bg-gray-100 h-10 w-full mb-1 rounded"></div>
      ))}
    </div>
  </div>
);

// Animation variants
const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

export default function TeacherCourseOfferingDetailPage() {
  const t = useI18n();
  const params = useParams();
  const router = useRouter();
  const id = Number(params.id);
  const queryClient = useQueryClient();

  const { data: session } = useSession();
  const userId = session?.user?.id as string;

  // Query for fetching course offering details
  const { 
    data: offering, 
    isPending, 
    isError, 
    refetch 
  } = useQuery({
    queryKey: ['courseOffering', id],
    queryFn: () => getCourseOffering(id),
    enabled: !isNaN(id),
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 1
  });

  const courseOfferingActions = useQuery({
    queryKey: ['courseOffering', id, 'actions'],
    queryFn: () => listCourseOfferingActions(id),
    enabled: !isNaN(id)
  });

  // Student availability query with improved status handling
  const studentAvailability = useQuery({
    queryKey: ['studentAvailability', offering?.student?.id],
    queryFn: () => getAvailabilityOfUser({ params: { user_id: offering?.student?.id as string } }),
    enabled: !!offering?.student?.id,
    retry: 2,
    retryDelay: 1000,
    onError: (error) => {
      console.error("Error fetching student availability:", error);
      toast.error(t("availability.errors.fetchFailed"));
    }
  });

  const createActionMutation = useMutation({
    mutationFn: createCourseOfferingAction,
    onSuccess: () => {
      toast.success(t("courseOfferings.actions.success.created"));
      courseOfferingActions.refetch();
    },
    onError: (error) => {
      console.log({ error });
      toast.error(t("courseOfferings.actions.error.created"));
    }
  });

  const updateActionMutation = useMutation({
    mutationFn: ({ actionId, status }: { actionId: number; status: ActionStatus }) =>
      updateCourseOfferingAction({ actionId, offeringId: id, data: { action: status } }),
    onSuccess: () => {
      toast.success(t("courseOfferings.actions.success.updated"));
      courseOfferingActions.refetch();
    },
    onError: () => {
      toast.error(t("courseOfferings.actions.error.updated"));
    }
  });

  const handleCreateAction = () => {
    createActionMutation.mutate({ offeringId: id, data: { teacher_id: userId, offer_id: id } });
  };

  const handleUpdateAction = (actionId: number, status: ActionStatus) => {
    updateActionMutation.mutate({ actionId, status });
  };

  if (isPending) {
    return (
      <div className="container py-10 flex justify-center items-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p>{t("courseOfferings.detail.loading")}</p>
        </div>
      </div>
    );
  }

  if (isError || !offering) {
    return (
      <div className="container py-10 flex flex-col justify-center items-center min-h-[60vh] gap-4">
        <p className="text-destructive text-lg">{t("courseOfferings.detail.notFound")}</p>
        <div className="flex gap-4">
          <Button onClick={() => refetch()}>{t("courseOfferings.detail.retry")}</Button>
          <Button variant="outline" onClick={() => router.push("/dashboard/course-offering")}>
            {t("courseOfferings.detail.actions.back")}
          </Button>
        </div>
      </div>
    );
  }

  // Check if the user has already sent a request
  const userAction = courseOfferingActions.data?.results.find(
    (action: CourseOfferingActionType) => action.teacher.id === userId
  );

  const days = ['lun', 'mar', 'mer', 'jeu', 'ven', 'sam', 'dim'] as DayOfWeek[];
  const timeSlots = ['matin', '13h-14h', '14h-15h', '15h-16h', '16h-17h', '17h-18h', '18h-19h', '19h-20h'] as TimeSlot[];

  const findSlot = (day: DayOfWeek, timeSlot: TimeSlot) => {
    return studentAvailability.data?.daily_slots.find(
      slot => slot.day === day && slot.time_slot === timeSlot
    );
  };

  // Calculate available time slots count for the summary
  const availableSlotsCount = studentAvailability.data?.daily_slots.filter(slot => slot.is_available).length || 0;
  const totalSlotsCount = days.length * timeSlots.length;
  const availabilityPercentage = Math.round((availableSlotsCount / totalSlotsCount) * 100);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="mx-auto w-full p-4 md:p-8 py-6 space-y-6 bg-gradient-to-b from-primary/5 via-background to-background"
    >
      {/* Header with back button */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <Button 
          variant="ghost" 
          className="p-0 h-auto flex items-center text-muted-foreground" 
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          {t("courseOfferings.detail.actions.back")}
        </Button>
      </div>
      
      {/* Title section with badge */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex flex-wrap items-center gap-3">
            {offering.subject.name}
            <Badge
              variant={offering.is_available ? "default" : "secondary"}
              className="text-sm"
            >
              {offering.is_available 
                ? t("courseOfferings.available") 
                : t("courseOfferings.unavailable")}
            </Badge>
          </h1>
          <p className="text-muted-foreground mt-1">{offering.class_level.name}</p>
        </div>
      </div>

      <Tabs defaultValue="details" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="details">{t("courseOfferings.detail.overview")}</TabsTrigger>
          <TabsTrigger value="availability">{t("availability.studentAvailability")}</TabsTrigger>
        </TabsList>
        
        <TabsContent value="details">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Main content */}
            <div className="md:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-primary" />
                    {t("courseOfferings.detail.courseDetails")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="flex items-center gap-2">
                        <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">{t("courseOfferings.detail.startDate")}</p>
                          <p className="text-sm text-muted-foreground">
                            {offering.start_date ? formatDate(offering.start_date) : "N/A"}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">{t("courseOfferings.detail.location")}</p>
                          <p className="text-sm text-muted-foreground">
                            {"Online"}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <p className="text-sm font-medium mb-2">{t("courseOfferings.detail.durationFrequency")}</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <p className="text-sm">{t("courseOfferings.detail.duration")}: {offering.duration} {t("courseOfferings.detail.hours")}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <p className="text-sm">{t("courseOfferings.detail.frequency")}: {offering.frequency} {t("courseOfferings.detail.timesPerWeek")}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Student section */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <UserCircle className="h-5 w-5 text-primary" />
                    {t("courseOfferings.detail.student")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {offering.student ? (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium">
                          {offering.student.first_name?.charAt(0)}{offering.student.last_name?.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium">{offering.student.first_name} {offering.student.last_name}</p>
                          <p className="text-sm text-muted-foreground">{offering.student.email}</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" asChild>
                        <a href={`/dashboard/students/${offering.student.id}`}>{t("courseOfferings.detail.view")}</a>
                      </Button>
                    </div>
                  ) : (
                    <p className="text-muted-foreground">{t("courseOfferings.detail.noStudents")}</p>
                  )}
                </CardContent>
              </Card>

              {/* Actions section */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-primary" />
                    {t("courseOfferings.detail.actions")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {!userAction && (
                    <Button onClick={handleCreateAction} disabled={createActionMutation.isPending}>
                      <Plus className="h-4 w-4 mr-2" />
                      {t("courseOfferings.actions.create")}
                    </Button>
                  )}
                  {courseOfferingActions.isPending ? (
                    <p>{t("courseOfferings.actions.loading")}</p>
                  ) : courseOfferingActions.isError ? (
                    <p>{t("courseOfferings.actions.error")}</p>
                  ) : courseOfferingActions.data?.results.length === 0 ? (
                    <p>{t("courseOfferings.actions.noActions")}</p>
                  ) : (
                    <div className="space-y-4 mt-4">
                      {courseOfferingActions.data?.results
                        .filter((action: CourseOfferingActionType) => action.teacher.id === userId)
                        .map((action: CourseOfferingActionType) => (
                          <div key={action.id} className="flex justify-between items-center p-4 border rounded-md">
                            <div>
                              <p className="text-sm font-medium">{action.teacher.first_name} {action.teacher.last_name}</p>
                              <p className="text-sm text-muted-foreground">{t(`courseOfferings.actions.status.${action.action.toLowerCase()}` as keyof typeof t)}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              {action.action === "PENDING" && (
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button variant="destructive" size="sm">
                                      <Trash className="h-4 w-4 mr-2" />
                                      {t("courseOfferings.actions.cancel")}
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>{t("courseOfferings.confirm.cancel")}</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        {t("courseOfferings.confirm.cancelDescription")}
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel disabled={updateActionMutation.isPending}>
                                        {t("courseOfferings.confirm.cancel")}
                                      </AlertDialogCancel>
                                      <AlertDialogAction 
                                        onClick={(e) => {
                                          e.preventDefault();
                                          handleUpdateAction(action.id, "CANCELLED");
                                        }}
                                        disabled={updateActionMutation.isPending}
                                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                      >
                                        {updateActionMutation.isPending ? (
                                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                        ) : null}
                                        {t("courseOfferings.confirm.confirm")}
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              )}
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
            
            {/* Sidebar */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>{t("courseOfferings.detail.information")}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm font-medium">{t("courseOfferings.hourlyRate")}</p>
                    <p className="text-xl font-bold">{formatCurrency(offering.hourly_rate)}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium">{t("courseOfferings.subject")}</p>
                    <p>{offering.subject.name}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium">{t("courseOfferings.class")}</p>
                    <p>{offering.class_level.definition_display}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium">{t("courseOfferings.detail.created")}</p>
                    <p className="text-muted-foreground">{offering.created_at ? formatDate(offering.created_at) : "N/A"}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium">{t("courseOfferings.detail.updated")}</p>
                    <p className="text-muted-foreground">{offering.updated_at ? formatDate(offering.updated_at) : "N/A"}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Removed the quick availability summary card */}
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="availability" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                {t("availability.studentAvailability")}
              </CardTitle>
              <CardDescription>
                {t("availability.scheduleDescription")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {studentAvailability.isLoading ? (
                <TableSkeleton />
              ) : !studentAvailability.data ? (
                <div className="bg-muted/50 p-8 text-center rounded-lg border border-border flex flex-col items-center">
                  <XCircle className="h-10 w-10 text-muted-foreground mb-3" />
                  <p className="text-muted-foreground font-medium">
                    {t('availability.studentNotVisibleWarning')}
                  </p>
                </div>
              ) : !studentAvailability.data.is_available ? (
                <div className="bg-muted/50 p-8 text-center rounded-lg border border-border flex flex-col items-center">
                  <Calendar className="h-10 w-10 text-muted-foreground mb-3" />
                  <p className="text-lg font-medium mb-2">
                    {t('availability.studentNotAvailable')}
                  </p>
                  <p className="text-muted-foreground max-w-md">
                    {t('availability.notAvailableDescription')}
                  </p>
                </div>
              ) : (
                <motion.div 
                  variants={container}
                  initial="hidden"
                  animate="show"
                  className="overflow-x-auto rounded-lg border border-border shadow-sm"
                >
                  <table className="min-w-full border-collapse">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="border border-border p-3 w-24 md:w-32 sticky left-0 bg-muted/50 z-10 text-muted-foreground font-medium">
                          {t('availability.timeSlot')}
                        </th>
                        {days.map(day => (
                          <motion.th 
                            variants={item}
                            key={day} 
                            className="border border-border p-3 text-center text-muted-foreground font-medium"
                          >
                            <span className="hidden md:inline">{`${day}.`}</span>
                            <span className="md:hidden">{day}</span>
                          </motion.th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {timeSlots.map((timeSlot, index) => (
                        <motion.tr 
                          variants={item}
                          key={timeSlot} 
                          className={index % 2 === 0 ? 'bg-white hover:bg-muted/10' : 'bg-muted/5 hover:bg-muted/10'}
                        >
                          <td className="border border-border p-3 font-medium text-center sticky left-0 z-10"
                            style={{ backgroundColor: index % 2 === 0 ? 'white' : 'rgb(var(--muted) / 0.05)' }}>
                            {timeSlot}
                          </td>
                          {days.map(day => {
                            const slot = findSlot(day, timeSlot);
                            return (
                              <td key={day} className="border border-border p-3 text-center">
                                <div className="flex justify-center">
                                  <Checkbox
                                    checked={slot?.is_available || false}
                                    disabled={true}
                                  />
                                </div>
                              </td>
                            );
                          })}
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </motion.div>
              )}

              {/* Availability Legend */}
              {studentAvailability.data && studentAvailability.data.is_available && (
                <div className="flex items-center justify-end gap-6 mt-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Checkbox checked={true} disabled={true} />
                    <span>{t('availability.legend.available')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox checked={false} disabled={true} />
                    <span>{t('availability.legend.unavailable')}</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}