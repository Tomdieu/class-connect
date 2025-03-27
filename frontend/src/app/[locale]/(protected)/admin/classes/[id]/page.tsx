"use client";
import { deleteSubject, getClass, listSubjects } from "@/actions/courses";
import { getStudentsByClass } from "@/actions/user-classes";
import { listSchoolYear } from "@/actions/enrollments";
import { useI18n } from "@/locales/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Book, Eye, Loader, Pencil, Plus, Trash2, Users } from "lucide-react";
import { useParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

import { Button } from "@/components/ui/button";
import { useSubjectStore } from "@/hooks/subject-store";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"; 
import Link from "next/link";
import DeleteConfirmationModal from "@/components/modals/DeleteConfirmationModal";
import { toast } from "sonner";
import { SubjectType } from "@/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

function ClassDetail() {
  const { id } = useParams<{ id: string }>();
  const t = useI18n();
  const { onAdd, setSubject } = useSubjectStore();
  const [subjectToDelete, setSubjectToDelete] = useState<SubjectType | null>(null);
  const queryClient = useQueryClient();
  
  // State for selected school year
  const [selectedSchoolYearId, setSelectedSchoolYearId] = useState<number | null>(null);
  
  // Calculate current school year for default display
  const today = new Date();
  const currentYear = today.getFullYear();
  const startYear = today.getMonth() >= 8 ? currentYear : currentYear - 1; // Assume school starts in September (month 8)
  const endYear = startYear + 1;
  const currentSchoolYear = `${startYear}-${endYear}`;

  // Query to fetch all available school years
  const schoolYearsQuery = useQuery({
    queryKey: ["school-years"],
    queryFn: listSchoolYear,
  });


  useEffect(()=>{
    if(schoolYearsQuery.data){
      const data = schoolYearsQuery.data
      if (!selectedSchoolYearId && data.length > 0) {
        const activeYear = data.find(year => year.is_active);
        if (activeYear) {
          setSelectedSchoolYearId(activeYear.start_year);
        } else if (data.length > 0) {
          setSelectedSchoolYearId(data[0].start_year);
        }
      }
    }
  },[schoolYearsQuery.data, selectedSchoolYearId])

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["class", id],
    queryFn: () => getClass(id),
  });

  const subjectQuery = useQuery({
    queryKey: ["class", id, "subjects"],
    queryFn: () => listSubjects({ class_pk: id }),
    enabled: data !== undefined,
  });
  
  // Updated students query to use the selected school year
  const studentsQuery = useQuery({
    queryKey: ["class", id, "students", selectedSchoolYearId],
    queryFn: () => getStudentsByClass(id, selectedSchoolYearId || undefined),
    enabled: data !== undefined && selectedSchoolYearId !== null,
  });

  const deleteSubjectMutation = useMutation({
    mutationFn: deleteSubject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["class", id, "subjects"] });
      toast.success(t("subject.delete.success"));
      setSubjectToDelete(null);
    },
    onError: (error) => {
      toast.error(t("subject.delete.error"), {
        description: error.message,
      });
    },
  });

  const handleDeleteSubject = (subject: SubjectType) => {
    setSubjectToDelete(subject);
  };

  const handleConfirmDelete = () => {
    if (subjectToDelete) {
      deleteSubjectMutation.mutate({
        class_pk: id,
        subject_pk: subjectToDelete.id.toString(),
      });
    }
  };
  
  // Handle school year change
  const handleSchoolYearChange = (value: string) => {
    setSelectedSchoolYearId(parseInt(value));
    // The query will automatically refetch with the new school year ID
  };

  // Get selected school year display name
  const getSelectedSchoolYearDisplay = (): string => {
    if (!schoolYearsQuery.data || !selectedSchoolYearId) return currentSchoolYear;
    
    const selectedYear = schoolYearsQuery.data.find(
      year => year.start_year === selectedSchoolYearId
    );
    
    return selectedYear ? selectedYear.formatted_year : currentSchoolYear;
  };

  if (isLoading) {
    return (
      <div className="container flex justify-center items-center h-screen">
        <Loader className="animate-spin size-8" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="container flex justify-center items-center h-screen">
        <div
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
          role="alert"
        >
          <strong className="font-bold">{t("error")}: </strong>
          <span className="block sm:inline">{error.message}</span>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="container py-10 flex flex-col gap-6">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/admin">{t("breadcrumb.dashboard")}</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/admin/classes/">{t("breadcrumb.class")}</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{data?.name}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="flex flex-col gap-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Book className="size-6" />
              <h1 className="text-2xl font-semibold">{t("class.detail.title")}</h1>
            </div>
            <Button onClick={() => data && data.id && onAdd(data.id)}>
              <Plus className="size-4 mr-2" />
              {t("class.detail.addButton")}
            </Button>
          </div>

          <Tabs defaultValue="subjects" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="subjects">{t("class.detail.subjectsTab")}</TabsTrigger>
              <TabsTrigger value="students">
                {t("class.detail.studentsCount")} ({studentsQuery.data?.length || 0})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="subjects">
              {subjectQuery.isLoading ? (
                <div className="flex justify-center py-10">
                  <Loader className="animate-spin size-8" />
                </div>
              ) : subjectQuery.data && subjectQuery.data.length > 0 ? (
                <div className="grid sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-5">
                  {subjectQuery.data?.map((subject) => (
                    <Card key={subject.id} className="group hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Book className="size-5" />
                          {subject.name}
                        </CardTitle>
                        {subject.description && (
                          <CardDescription className="line-clamp-2">
                            {subject.description}
                          </CardDescription>
                        )}
                      </CardHeader>
                      <CardContent>
                        {/* Add any additional subject content here */}
                      </CardContent>
                      <CardFooter className="justify-between">
                        <TooltipProvider>
                          <div className="flex items-center gap-2">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  onClick={() => setSubject(subject)}
                                >
                                  <Pencil className="size-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>{t("subject.edit")}</TooltipContent>
                            </Tooltip>

                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button 
                                  variant="outline" 
                                  size="icon"
                                  onClick={() => handleDeleteSubject(subject)}
                                >
                                  <Trash2 className="size-4 text-destructive" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>{t("subject.delete")}</TooltipContent>
                            </Tooltip>
                          </div>
                        </TooltipProvider>

                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Link href={`/admin/classes/${id}/subjects/${subject.id}/chapters`}>
                            <Button variant="default">
                              <Eye className="size-4 mr-2" />
                              {t("class.detail.viewChapters")}
                            </Button>
                            </Link>
                          </TooltipTrigger>
                          <TooltipContent>{t("class.detail.viewChapters")}</TooltipContent>
                        </Tooltip>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 bg-muted/10 rounded-md border border-dashed">
                  <Book className="size-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                  <h3 className="text-xl font-semibold mb-2">{t("class.detail.noSubjects")}</h3>
                  <p className="text-muted-foreground max-w-md mx-auto mb-6">
                    {t("class.detail.noSubjectsDesc")}
                  </p>
                  <Button onClick={() => data && data.id && onAdd(data.id)}>
                    <Plus className="size-4 mr-2" />
                    {t("class.detail.addFirstSubject")}
                  </Button>
                </div>
              )}

              {subjectQuery.isError && (
                <div
                  className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
                  role="alert"
                >
                  <strong className="font-bold">{t("error")}: </strong>
                  <span className="block sm:inline">{subjectQuery.error.message}</span>
                </div>
              )}
            </TabsContent>

            <TabsContent value="students">
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Users className="size-5" />
                      {t("class.detail.enrolledStudents")}
                    </CardTitle>
                    
                    {/* School Year Selector */}
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">{t("class.detail.schoolYear")}:</span>
                      {schoolYearsQuery.isLoading ? (
                        <div className="h-9 w-[180px] flex items-center justify-center bg-muted/50 rounded-md">
                          <Loader className="size-4 animate-spin" />
                        </div>
                      ) : (
                        <Select 
                          value={selectedSchoolYearId?.toString()} 
                          onValueChange={handleSchoolYearChange}
                        >
                          <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder={t("class.detail.selectSchoolYear")} />
                          </SelectTrigger>
                          <SelectContent>
                            {schoolYearsQuery.data?.map((year) => (
                              <SelectItem 
                                key={year.start_year} 
                                value={year.start_year.toString()}
                              >
                                {year.formatted_year} {year.is_active ? "(Current)" : ""}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    </div>
                  </div>
                  <CardDescription>
                    {t("class.detail.enrolledStudentsFor", { year: getSelectedSchoolYearDisplay() })}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {studentsQuery.isLoading ? (
                    <div className="flex justify-center py-10">
                      <Loader className="animate-spin size-8" />
                    </div>
                  ) : studentsQuery.data && studentsQuery.data.length > 0 ? (
                    <div className="border rounded-md">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b bg-muted/50">
                            <th className="py-2 px-4 text-left font-medium">{t("class.detail.studentInfo")}</th>
                            <th className="py-2 px-4 text-left font-medium">{t("class.detail.studentEmail")}</th>
                            <th className="py-2 px-4 text-left font-medium">{t("class.detail.studentEnrollmentDate")}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {studentsQuery.data.map((enrollment) => (
                            <tr key={enrollment.id} className="border-b last:border-0">
                              <td className="py-3 px-4">
                                <div className="flex items-center gap-2">
                                  <Avatar className="size-8">
                                    <AvatarImage src={enrollment.user.profile_picture || ''} />
                                    <AvatarFallback>
                                      {enrollment.user.first_name?.[0] || ''}{enrollment.user.last_name?.[0] || ''}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <p className="font-medium">{enrollment.user.first_name} {enrollment.user.last_name}</p>
                                    <p className="text-xs text-muted-foreground">{enrollment.user.phone_number}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="py-3 px-4 text-sm">{enrollment.user.email}</td>
                              <td className="py-3 px-4 text-sm">
                                {new Date(enrollment.created_at).toLocaleDateString()}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-12 bg-muted/10 rounded-md">
                      <Users className="size-12 text-muted-foreground mx-auto mb-2 opacity-50" />
                      <h3 className="text-xl font-semibold mb-2">{t("class.detail.noStudents")}</h3>
                      <p className="text-muted-foreground max-w-md mx-auto mb-6">
                        {t("class.detail.noStudentsDesc", { year: getSelectedSchoolYearDisplay() })}
                      </p>
                    </div>
                  )}
                  
                  {studentsQuery.isError && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mt-4">
                      <strong className="font-bold">{t("error")}: </strong>
                      <span className="block sm:inline">{studentsQuery.error.message}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <DeleteConfirmationModal
        isOpen={!!subjectToDelete}
        onClose={() => setSubjectToDelete(null)}
        onConfirm={handleConfirmDelete}
        title={t("subject.delete.title")}
        description={t("subject.delete.description")}
        isLoading={deleteSubjectMutation.isPending}
      />
    </>
  );
}

export default ClassDetail;