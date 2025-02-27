"use client";
import { deleteSubject, getClass, listSubjects } from "@/actions/courses";
import { useI18n } from "@/locales/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Book, Eye, Loader, Pencil, Plus, Trash2 } from "lucide-react";
import { useParams } from "next/navigation";
import React, { useState } from "react";
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

function SubjectsPage() {
  const { id } = useParams<{ id: string }>();
  const t = useI18n();
  const { onAdd, setSubject } = useSubjectStore();
  const [subjectToDelete, setSubjectToDelete] = useState<SubjectType | null>(null);
  const queryClient = useQueryClient();

  // Fetch class details
  const { data: classData, isLoading: isClassLoading, isError: isClassError, error: classError } = useQuery({
    queryKey: ["class", id],
    queryFn: () => getClass(id),
  });

  // Fetch subjects for this class
  const { data: subjects, isLoading: isSubjectsLoading, isError: isSubjectsError, error: subjectsError } = useQuery({
    queryKey: ["class", id, "subjects"],
    queryFn: () => listSubjects({ class_pk: id }),
    enabled: !!classData,
  });

  // Delete subject mutation
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

  // Show loading state
  if (isClassLoading || isSubjectsLoading) {
    return (
      <div className="container flex justify-center items-center h-screen">
        <Loader className="animate-spin size-8" />
      </div>
    );
  }

  // Show error state
  if (isClassError) {
    return (
      <div className="container flex justify-center items-center h-screen">
        <div
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
          role="alert"
        >
          <strong className="font-bold">{t("error")}: </strong>
          <span className="block sm:inline">{classError.message}</span>
        </div>
      </div>
    );
  }

  if (isSubjectsError) {
    return (
      <div className="container flex justify-center items-center h-screen">
        <div
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
          role="alert"
        >
          <strong className="font-bold">{t("error")}: </strong>
          <span className="block sm:inline">{subjectsError.message}</span>
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
              <BreadcrumbLink href="/admin">Dashboard</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/admin/classes/">Classes</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{classData?.name}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="flex flex-col gap-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Book className="size-6" />
              <h1 className="text-2xl font-semibold">{t("class.detail.title")}</h1>
            </div>
            <Button onClick={() => classData && classData.id && onAdd(classData.id)}>
              <Plus className="size-4 mr-2" />
              {t("class.detail.addButton")}
            </Button>
          </div>

          {subjects && subjects.length > 0 ? (
            <div className="grid sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-5">
              {subjects.map((subject) => (
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
                            {t("chapter.title")}
                          </Button>
                        </Link>
                      </TooltipTrigger>
                      <TooltipContent>{t("ui.viewClasses")}</TooltipContent>
                    </Tooltip>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Book className="size-12 text-gray-300 mb-2" />
              <h3 className="text-xl font-medium mb-1">{t("class.detail.empty")}</h3>
              <p className="text-gray-500 mb-4">{t("class.detail.noSubjects")}</p>
              <Button onClick={() => classData && classData.id && onAdd(classData.id)}>
                <Plus className="size-4 mr-2" />
                {t("class.detail.addButton")}
              </Button>
            </div>
          )}
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

export default SubjectsPage;