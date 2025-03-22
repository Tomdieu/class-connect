"use client";

import { getCourseOffering, createCourseOfferingAction, updateCourseOfferingAction, listCourseOfferingActions } from "@/actions/course-offerings";
import { getAvailabilityOfUser } from "@/actions/user-availability";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/locales/client";
import { ArrowLeft, CalendarIcon, Loader2, MapPin, UserCircle, Plus, Trash } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useQuery, useMutation } from "@tanstack/react-query";
import { UserType, CourseOfferingActionType, ActionStatus, DayOfWeek, TimeSlot } from "@/types";
import { toast } from "sonner";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { useSession } from "next-auth/react";

const Checkbox = ({ checked, disabled = false }:{checked:boolean,disabled:boolean}) => (
  <input
    type="checkbox"
    checked={checked}
    className="h-5 w-5 rounded border-gray-300 cursor-pointer"
    disabled={disabled}
  />
);

const TableSkeleton = () => (
  <div className="overflow-x-auto animate-pulse">
    <div className="min-w-full">
      <div className="bg-gray-200 h-12 w-full mb-1"></div>
      {Array(8).fill(0).map((_, i) => (
        <div key={i} className="bg-gray-100 h-10 w-full mb-1"></div>
      ))}
    </div>
  </div>
);


export default function TeacherCourseOfferingDetailPage() {
  const t = useI18n();
  const params = useParams();
  const router = useRouter();
  const id = Number(params.id);

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

  const studentAvailability = useQuery({
    queryKey: ['studentAvailability', offering?.student?.id],
    queryFn: () => getAvailabilityOfUser({ params: { user_id: offering?.student?.id as string } }),
    enabled: !!offering?.student?.id
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

  // Extract student from course offering
  // const student: UserType | null = offering.student || null;

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

  return (
    <div className="mx-auto w-full p-8 py-6 space-y-6">
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="md:col-span-2 space-y-6">
          <div>
            <h2 className="text-xl font-semibold">{t("courseOfferings.detail.overview")}</h2>
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
                  <div>
                    <p className="text-sm">{t("courseOfferings.detail.duration")}: {offering.duration} {t("courseOfferings.detail.hours")}</p>
                  </div>
                  <div>
                    <p className="text-sm">{t("courseOfferings.detail.frequency")}: {offering.frequency} {t("courseOfferings.detail.timesPerWeek")}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Student section */}
          {/* <div>
            <h2 className="text-xl font-semibold">
              <div className="flex items-center gap-2">
                <UserCircle className="h-5 w-5" />
                {t("courseOfferings.detail.students")}
              </div>
            </h2>
            <div>
              {student ? (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                      {student.first_name?.charAt(0)}{student.last_name?.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium">{student.first_name} {student.last_name}</p>
                      <p className="text-sm text-muted-foreground">{student.email}</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" asChild>
                    <a href={`/dashboard/students/${student.id}`}>{t("courseOfferings.detail.view")}</a>
                  </Button>
                </div>
              ) : (
                <p className="text-muted-foreground">{t("courseOfferings.detail.noStudents")}</p>
              )}
            </div>
          </div> */}

          {/* Student Availability section */}
          <div>
            <h2 className="text-xl font-semibold">{t("availability.studentAvailability")}</h2>
            <div>
              {studentAvailability.isLoading ? (
                <TableSkeleton />
              ) : !studentAvailability.data ? (
                <div className="bg-gray-50 p-6 text-center rounded-lg border border-gray-200">
                  <p className="text-gray-600">
                    {t('availability.studentNotVisibleWarning')}
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full border-collapse">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="border p-2 w-24 md:w-32 sticky left-0 bg-gray-50 z-10">{t('availability.timeSlot')}</th>
                        {days.map(day => (
                          <th key={day} className="border p-2 text-center">
                            <span className="hidden md:inline">{`${day}.`}</span>
                            <span className="md:hidden">{day}</span>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {timeSlots.map(timeSlot => (
                        <tr key={timeSlot} className="hover:bg-gray-50">
                          <td className="border p-2 font-medium text-center sticky left-0 bg-white z-10">{timeSlot}</td>
                          {days.map(day => {
                            const slot = findSlot(day, timeSlot);
                            return (
                              <td key={day} className="border p-2 text-center">
                                <Checkbox
                                  checked={slot?.is_available || false}
                                  disabled
                                />
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* Actions section */}
          <div>
            <h2 className="text-xl font-semibold">{t("courseOfferings.detail.actions")}</h2>
            <div>
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
            </div>
          </div>
        </div>
        
        {/* Sidebar */}
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold">{t("courseOfferings.detail.information")}</h2>
            <div className="space-y-4">
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
                <p>{offering.class_level.name}</p>
              </div>
              
              <div>
                <p className="text-sm font-medium">{t("courseOfferings.detail.created")}</p>
                <p className="text-muted-foreground">{offering.created_at ? formatDate(offering.created_at) : "N/A"}</p>
              </div>
              
              <div>
                <p className="text-sm font-medium">{t("courseOfferings.detail.updated")}</p>
                <p className="text-muted-foreground">{offering.updated_at ? formatDate(offering.updated_at) : "N/A"}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}