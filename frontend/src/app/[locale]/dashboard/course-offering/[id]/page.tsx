"use client";

import { deleteCourseOffering, getCourseOffering } from "@/actions/course-offerings";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { useI18n } from "@/locales/client";
import { ArrowLeft, CalendarIcon, Edit, Loader2, MapPin, Trash, UserCircle } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { formatCurrency, formatDate } from "@/lib/utils";
import { toast } from "sonner";
import { useQuery, useMutation } from "@tanstack/react-query";
import {UserType} from "@/types"

export default function CourseOfferingDetailPage() {
  const t = useI18n();
  const params = useParams();
  const router = useRouter();
  const id = Number(params.id);

  // Query for fetching course offering details
  const { 
    data: offering, 
    isLoading, 
    isError, 
    refetch 
  } = useQuery({
    queryKey: ['courseOffering', id],
    queryFn: () => getCourseOffering(id),
    enabled: !isNaN(id),
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 1
  });

  // Mutation for deleting a course offering
  const deleteMutation = useMutation({
    mutationFn: (offeringId: number) => deleteCourseOffering(offeringId),
    onSuccess: () => {
      toast.success(t("courseOfferings.success.deleted"));
      router.push("/dashboard/course-offering");
    },
    onError: () => {
      toast.error(t("courseOfferings.error.deleted"));
    }
  });

  const handleDelete = () => {
    if (offering) {
      deleteMutation.mutate(offering.id);
    }
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
          <p className="text-muted-foreground mt-1">{offering.class_level.name}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild variant="outline">
            <a href={`/dashboard/course-offering/${offering.id}/edit`}>
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
                <AlertDialogTitle>{t("courseOfferings.confirm.delete")}</AlertDialogTitle>
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
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="md:col-span-2 space-y-6">
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
                  <p className="text-sm font-medium mb-2">Duration & Frequency</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm">Duration: {offering.duration} hours</p>
                    </div>
                    <div>
                      <p className="text-sm">Frequency: {offering.frequency} times per week</p>
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
                      {student.first_name?.charAt(0)}{student.last_name?.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium">{student.first_name} {student.last_name}</p>
                      <p className="text-sm text-muted-foreground">{student.email}</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" asChild>
                    <a href={`/dashboard/students/${student.id}`}>View</a>
                  </Button>
                </div>
              ) : (
                <p className="text-muted-foreground">{t("courseOfferings.detail.noStudents")}</p>
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
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium">{t("courseOfferings.hourlyRate")}</p>
                  <p className="text-xl font-bold">{formatCurrency(offering.hourly_rate)}</p>
                </div>
                
                <Separator />
                
                <div>
                  <p className="text-sm font-medium">{t("courseOfferings.subject")}</p>
                  <p>{offering.subject.name}</p>
                </div>
                
                <div>
                  <p className="text-sm font-medium">{t("courseOfferings.class")}</p>
                  <p>{offering.class_level.name}</p>
                </div>
                
                <Separator />
                
                <div>
                  <p className="text-sm font-medium">{t("courseOfferings.detail.created")}</p>
                  <p className="text-muted-foreground">{formatDate(offering.created_at)}</p>
                </div>
                
                <div>
                  <p className="text-sm font-medium">{t("courseOfferings.detail.updated")}</p>
                  <p className="text-muted-foreground">{formatDate(offering.updated_at)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}