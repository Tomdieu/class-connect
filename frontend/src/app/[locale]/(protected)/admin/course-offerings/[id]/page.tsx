"use client";

import React from "react";
import {
  deleteCourseOffering,
  getCourseOffering,
  listCourseOfferingActions,
  updateCourseOfferingAction,
} from "@/actions/course-offerings";
import {
  listEnrollments,
  completeEnrollment,
  listEnrollmentDeclarations,
  updateEnrollmentDeclarationStatus,
} from "@/actions/enrollments";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useI18n } from "@/locales/client";
import {
  ArrowLeft,
  CalendarIcon,
  Edit,
  Loader2,
  MapPin,
  Trash,
  UserCircle,
  BookOpen,
  FileText,
  CheckCircle,
  Clock,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { formatCurrency, formatDate } from "@/lib/utils";
import { toast } from "sonner";
import { useQuery, useMutation } from "@tanstack/react-query";
import { 
  UserType, 
  CourseOfferingActionType, 
  ActionStatus, 
  TeacherStudentEnrollmentType,
  CourseDeclarationType 
} from "@/types";

export default function CourseOfferingDetailPage() {
  const t = useI18n();
  const params = useParams();
  const router = useRouter();
  const id = Number(params?.id);

  // Query for fetching course offering details
  const {
    data: offering,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["courseOffering", id],
    queryFn: () => getCourseOffering(id),
    enabled: !isNaN(id),
    staleTime: 1000 * 30, // 30 seconds
    retry: 1,
  });

  const courseOfferingActions = useQuery({
    queryKey: ["courseOffering", id, "actions"],
    queryFn: () => listCourseOfferingActions(id),
    enabled: !isNaN(id),
  });

  // Query for enrollments related to this course offering
  const enrollments = useQuery({
    queryKey: ["enrollments", "course-offering", id],
    queryFn: () => listEnrollments({ offer: id }),
    enabled: !isNaN(id),
  });

  const updateActionMutation = useMutation({
    mutationFn: ({
      actionId,
      status,
    }: {
      actionId: number;
      status: ActionStatus;
    }) =>
      updateCourseOfferingAction({
        actionId,
        offeringId: id,
        data: { action: status },
      }),
    onSuccess: () => {
      toast.success(t("courseOfferings.actions.success.updated"));
      courseOfferingActions.refetch();
    },
    onError: () => {
      toast.error(t("courseOfferings.actions.error.updated"));
    },
  });

  // Mutation for completing an enrollment (marking class as ended)
  const completeEnrollmentMutation = useMutation({
    mutationFn: (enrollmentId: number) => completeEnrollment(enrollmentId),
    onSuccess: () => {
      toast.success("Enrollment completed successfully");
      enrollments.refetch();
    },
    onError: () => {
      toast.error("Failed to complete enrollment");
    },
  });

  // Mutation for updating declaration status
  const updateDeclarationStatusMutation = useMutation({
    mutationFn: ({ 
      enrollmentId, 
      declarationId, 
      status 
    }: { 
      enrollmentId: number; 
      declarationId: number; 
      status: Omit<ActionStatus, "CANCELLED"> 
    }) =>
      updateEnrollmentDeclarationStatus(enrollmentId, declarationId, { status }),
    onSuccess: () => {
      toast.success("Declaration status updated successfully");
      // Refetch the specific enrollment declarations
      enrollments.refetch();
    },
    onError: () => {
      toast.error("Failed to update declaration status");
    },
  });

  const handleUpdateAction = (actionId: number, status: ActionStatus) => {
    updateActionMutation.mutate({ actionId, status });
  };

  const handleCompleteEnrollment = (enrollmentId: number) => {
    completeEnrollmentMutation.mutate(enrollmentId);
  };

  const handleUpdateDeclarationStatus = (
    enrollmentId: number,
    declarationId: number,
    status: Omit<ActionStatus, "CANCELLED">
  ) => {
    updateDeclarationStatusMutation.mutate({ enrollmentId, declarationId, status });
  };

  // Mutation for deleting a course offering
  const deleteMutation = useMutation({
    mutationFn: (offeringId: number) => deleteCourseOffering(offeringId),
    onSuccess: () => {
      toast.success(t("courseOfferings.success.deleted"));
      router.push("/dashboard/course-offering");
    },
    onError: () => {
      toast.error(t("courseOfferings.error.deleted"));
    },
  });

  const handleDelete = () => {
    if (offering) {
      deleteMutation.mutate(offering.id);
    }
  };

  // Component for rendering enrollment item
  const EnrollmentItem = ({ enrollment }: { enrollment: TeacherStudentEnrollmentType }) => {
    const [declarations, setDeclarations] = React.useState<CourseDeclarationType[]>([]);
    const [loadingDeclarations, setLoadingDeclarations] = React.useState(false);
    const [showDeclarations, setShowDeclarations] = React.useState(false);

    const loadDeclarations = async () => {
      if (showDeclarations || declarations.length > 0) {
        setShowDeclarations(!showDeclarations);
        return;
      }
      
      setLoadingDeclarations(true);
      try {
        const result = await listEnrollmentDeclarations(enrollment.id);
        setDeclarations(result.results);
        setShowDeclarations(true);
      } catch (error) {
        toast.error("Failed to load declarations");
      } finally {
        setLoadingDeclarations(false);
      }
    };

    return (
      <Card className="mb-4">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="flex items-center gap-2">
                <UserCircle className="h-5 w-5" />
                {enrollment.teacher.first_name} {enrollment.teacher.last_name}
                <Badge variant={enrollment.has_class_end ? "secondary" : "default"}>
                  {enrollment.has_class_end ? "Completed" : "Active"}
                </Badge>
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Started: {formatDate(enrollment.created_at)}
              </p>
              <p className="text-sm text-muted-foreground">
                School Year: {enrollment.school_year.formatted_year}
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={loadDeclarations}
                disabled={loadingDeclarations}
              >
                {loadingDeclarations ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <FileText className="h-4 w-4 mr-2" />
                )}
                {showDeclarations ? "Hide" : "Show"} Declarations
              </Button>
              {!enrollment.has_class_end && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button 
                      variant="default" 
                      size="sm"
                      disabled={completeEnrollmentMutation.isPending}
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Complete Class
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Complete Enrollment</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will mark the class as ended. This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleCompleteEnrollment(enrollment.id)}
                      >
                        Complete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>
          </div>
        </CardHeader>
        {showDeclarations && (
          <CardContent>
            <div className="space-y-4">
              <h4 className="font-medium text-sm">Course Declarations</h4>
              {declarations.length === 0 ? (
                <p className="text-muted-foreground text-sm">No declarations found</p>
              ) : (
                <div className="space-y-3">
                  {declarations.map((declaration) => (
                    <DeclarationItem 
                      key={declaration.id} 
                      declaration={declaration}
                      enrollmentId={enrollment.id}
                    />
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        )}
      </Card>
    );
  };

  // Component for rendering declaration item
  const DeclarationItem = ({ 
    declaration, 
    enrollmentId 
  }: { 
    declaration: CourseDeclarationType;
    enrollmentId: number;
  }) => {
    const getStatusColor = (status: ActionStatus) => {
      switch (status) {
        case "ACCEPTED": return "default";
        case "PENDING": return "secondary";
        case "REJECTED": return "destructive";
        default: return "secondary";
      }
    };

    const getStatusIcon = (status: ActionStatus) => {
      switch (status) {
        case "ACCEPTED": return <CheckCircle className="h-4 w-4" />;
        case "PENDING": return <Clock className="h-4 w-4" />;
        case "REJECTED": return <Trash className="h-4 w-4" />;
        default: return <Clock className="h-4 w-4" />;
      }
    };

    return (
      <div className="border rounded-lg p-4 space-y-3">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge variant={getStatusColor(declaration.status)} className="flex items-center gap-1">
                {getStatusIcon(declaration.status)}
                {declaration.status}
              </Badge>
              <span className="text-sm font-medium">
                {declaration.duration} hours
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              Date: {formatDate(declaration.declaration_date)}
            </p>
            <p className="text-sm text-muted-foreground">
              Updated: {formatDate(declaration.updated_at)}
            </p>
            {declaration.accepted_by && (
              <p className="text-sm text-muted-foreground">
                Accepted by: {declaration.accepted_by.name}
              </p>
            )}
            {declaration.payment_date && (
              <p className="text-sm text-green-600">
                Paid on: {formatDate(declaration.payment_date)}
              </p>
            )}
          </div>
          
          {declaration.status === "PENDING" && (
            <div className="flex gap-2">
              <Select
                onValueChange={(value) => 
                  handleUpdateDeclarationStatus(
                    enrollmentId, 
                    declaration.id, 
                    value as Omit<ActionStatus, "CANCELLED">
                  )
                }
                disabled={updateDeclarationStatusMutation.isPending}
              >
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Update status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ACCEPTED">Accept</SelectItem>
                  <SelectItem value="REJECTED">Reject</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        {declaration.payment_comment && (
          <div className="bg-muted p-3 rounded-md">
            <p className="text-sm font-medium mb-1">Payment Comment:</p>
            <p className="text-sm text-muted-foreground">{declaration.payment_comment}</p>
          </div>
        )}
      </div>
    );
  };

  if (isLoading) {
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
        <p className="text-destructive text-lg">
          {t("courseOfferings.detail.notFound")}
        </p>
        <div className="flex gap-4">
          <Button onClick={() => refetch()}>
            {t("courseOfferings.detail.retry")}
          </Button>
          <Button
            variant="outline"
            onClick={() => router.push("/dashboard/course-offering")}
          >
            {t("courseOfferings.detail.actions.back")}
          </Button>
        </div>
      </div>
    );
  }

  // Extract student from course offering
  const student: UserType | null = offering.student || null;

  return (
    <div className="container py-6 space-y-6">
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
          <p className="text-muted-foreground mt-1">
            {offering.class_level.definition_display}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {offering.is_available && (
            <>
              <Button asChild variant="outline">
                <a href={`/admin/course-offerings/${offering.id}/edit`}>
                  <Edit className="h-4 w-4 mr-2" />
                  {t("courseOfferings.detail.actions.edit")}
                </a>
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive">
                    <Trash className="h-4 w-4 mr-2" />
                    {t("courseOfferings.detail.actions.delete")}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      {t("courseOfferings.confirm.delete")}
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      {t("courseOfferings.confirm.deleteDescription")}
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel disabled={deleteMutation.isPending}>
                      {t("courseOfferings.confirm.cancel")}
                    </AlertDialogCancel>
                    <AlertDialogAction
                      onClick={(e) => {
                        e.preventDefault();
                        handleDelete();
                      }}
                      disabled={deleteMutation.isPending}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      {deleteMutation.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : null}
                      {t("courseOfferings.confirm.confirm")}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="md:col-span-2 space-y-6">
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="enrollments">
                <BookOpen className="h-4 w-4 mr-2" />
                Enrollments
                {enrollments.data && (
                  <Badge variant="secondary" className="ml-2">
                    {enrollments.data.results.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="actions">Actions</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>{t("courseOfferings.detail.overview")}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="flex items-center gap-2">
                        <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">
                            {t("courseOfferings.detail.startDate")}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {offering.start_date
                              ? formatDate(offering.start_date)
                              : "N/A"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">
                            {t("courseOfferings.detail.location")}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {"Online"}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <p className="text-sm font-medium mb-2">
                        Duration & Frequency
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm">
                            Duration: {offering.duration} hours
                          </p>
                        </div>
                        <div>
                          <p className="text-sm">
                            Frequency: {offering.frequency} times per week
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Student section */}
              <Card>
                <CardHeader>
                  <CardTitle>
                    <div className="flex items-center gap-2">
                      <UserCircle className="h-5 w-5" />
                      {t("courseOfferings.detail.students")}
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {student ? (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                          {student.first_name?.charAt(0)}
                          {student.last_name?.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium">
                            {student.first_name} {student.last_name}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {student.email}
                          </p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" asChild>
                        <a href={`/admin/users/${student.id}`}>View</a>
                      </Button>
                    </div>
                  ) : (
                    <p className="text-muted-foreground">
                      {t("courseOfferings.detail.noStudents")}
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="enrollments" className="space-y-6 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-5 w-5" />
                      Course Enrollments
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {enrollments.isLoading ? (
                    <div className="flex justify-center items-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin" />
                    </div>
                  ) : enrollments.isError ? (
                    <p className="text-destructive">Failed to load enrollments</p>
                  ) : enrollments.data?.results.length === 0 ? (
                    <p className="text-muted-foreground">No enrollments found</p>
                  ) : (
                    <div className="space-y-4">
                      {enrollments.data?.results.map((enrollment) => (
                        <EnrollmentItem key={enrollment.id} enrollment={enrollment} />
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="actions" className="space-y-6 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>{t("courseOfferings.detail.actions")}</CardTitle>
                </CardHeader>
                <CardContent>
                  {courseOfferingActions.isLoading ? (
                    <p>{t("courseOfferings.actions.loading")}</p>
                  ) : courseOfferingActions.isError ? (
                    <p>{t("courseOfferings.actions.error")}</p>
                  ) : courseOfferingActions.data?.results.length === 0 ? (
                    <p>{t("courseOfferings.actions.noActions")}</p>
                  ) : (
                    <div className="space-y-4">
                      {courseOfferingActions.data?.results.map(
                        (action: CourseOfferingActionType) => (
                          <div
                            key={action.id}
                            className="flex justify-between items-center p-4 border rounded-md"
                          >
                            <div>
                              <p className="text-sm font-medium">
                                {action.teacher.first_name}{" "}
                                {action.teacher.last_name}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {t(
                                  `courseOfferings.actions.status.${action.action.toLowerCase()}` as keyof typeof t
                                )}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              {action.action === "PENDING" && (
                                <>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                      handleUpdateAction(action.id, "ACCEPTED")
                                    }
                                    disabled={updateActionMutation.isPending}
                                  >
                                    {t("courseOfferings.actions.accept")}
                                  </Button>
                                  <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() =>
                                      handleUpdateAction(action.id, "REJECTED")
                                    }
                                    disabled={updateActionMutation.isPending}
                                  >
                                    {t("courseOfferings.actions.reject")}
                                  </Button>
                                </>
                              )}
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t("courseOfferings.detail.information")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium">
                    {t("courseOfferings.hourlyRate")}
                  </p>
                  <p className="text-xl font-bold">
                    {formatCurrency(offering.hourly_rate)}
                  </p>
                </div>

                <Separator />

                <div>
                  <p className="text-sm font-medium">
                    {t("courseOfferings.subject")}
                  </p>
                  <p>{offering.subject.name}</p>
                </div>

                <div>
                  <p className="text-sm font-medium">
                    {t("courseOfferings.class")}
                  </p>
                  <p>{offering.class_level.definition_display}</p>
                </div>

                <Separator />

                <div>
                  <p className="text-sm font-medium">
                    {t("courseOfferings.detail.created")}
                  </p>
                  <p className="text-muted-foreground">
                    {formatDate(offering.created_at)}
                  </p>
                </div>

                <div>
                  <p className="text-sm font-medium">
                    {t("courseOfferings.detail.updated")}
                  </p>
                  <p className="text-muted-foreground">
                    {formatDate(offering.updated_at)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
