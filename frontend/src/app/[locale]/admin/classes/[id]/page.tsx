"use client";
import { getClass, listSubjects } from "@/actions/courses";
import { useI18n } from "@/locales/client";
import { useQuery } from "@tanstack/react-query";
import { Book, Eye, Loader, Pencil, Plus, Trash2 } from "lucide-react";
import { useParams } from "next/navigation";
import React from "react";
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

function ClassDetail() {
  const { id } = useParams<{ id: string }>();
  const t = useI18n();
  const { onAdd, setSubject } = useSubjectStore();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["class", id],
    queryFn: () => getClass(id),
  });

  const subjectQuery = useQuery({
    queryKey: ["class", id, "subjects"],
    queryFn: () => listSubjects({ class_pk: id }),
    enabled: data !== undefined,
  });

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
    <div className="container py-10 flex flex-col gap-6">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/admin">Dashboard</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/admin/classes/">Class</BreadcrumbLink>
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
            <h1 className="text-2xl font-semibold">Matiers</h1>
          </div>
          <Button onClick={() => data && data.id && onAdd(data.id)}>
            <Plus className="size-4 mr-2" />
            Ajouter une matier
          </Button>
        </div>

        {subjectQuery.isLoading ? (
          <div className="flex justify-center py-10">
            <Loader className="animate-spin size-8" />
          </div>
        ) : (
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
                        <TooltipContent>Edit Subject</TooltipContent>
                      </Tooltip>

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="outline" size="icon">
                            <Trash2 className="size-4 text-destructive" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Delete Subject</TooltipContent>
                      </Tooltip>
                    </div>
                  </TooltipProvider>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Link href={`/admin/classes/${id}/subjects/${subject.id}`}>
                      <Button variant="default">
                        <Eye className="size-4 mr-2" />
                        View Chapters
                      </Button>
                      </Link>
                    </TooltipTrigger>
                    <TooltipContent>View Subject Chapters</TooltipContent>
                  </Tooltip>
                </CardFooter>
              </Card>
            ))}
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
      </div>
    </div>
  );
}

export default ClassDetail;