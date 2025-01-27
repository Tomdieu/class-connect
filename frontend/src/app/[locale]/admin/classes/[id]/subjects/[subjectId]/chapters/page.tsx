"use client";
import { getSubject, listChapters } from "@/actions/courses";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import React from "react";
import { ArrowLeft, Eye, Loader, Pencil, Trash2 } from "lucide-react";

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
import { Button } from "@/components/ui/button";
import Link from "next/link";
import BackButton from "@/components/BackButton";
import { useChapterStore } from "@/hooks/chapter-store";

function SubjectChapters() {
  const { id, subjectId } = useParams<{ id: string; subjectId: string }>();
  const { setChapter, onAdd } = useChapterStore();
  const subjectQuery = useQuery({
    queryKey: ["class", id, "subjects", subjectId],
    queryFn: () => getSubject({ class_pk: id, subject_pk: subjectId }),
  });
  const { data, isError, error, isLoading } = useQuery({
    queryKey: ["class", id, "subjects", subjectId, "chapters"],
    queryFn: () => listChapters({ class_pk: id, subject_pk: subjectId }),
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
    <div className="container py-10 flex flex-col gap-5">
      <div className="grid 2xl:grid-cols-12 gap-5">
        <div className="col-span-3">
          <div>
            <Link
              className="flex items-center gap-1"
              href={`/admin/classes/${id}/subjects/${subjectId}/`}
            >
              <BackButton />
            </Link>
          </div>
          <h1 className="text-3xl font-medium">Subject</h1>
          <div>
            {subjectQuery.data && (
              <div className="flex flex-col gap-4">
                <h2 className="text-lg font-medium">
                  {subjectQuery.data?.name}
                </h2>
                <p className="text-muted-foreground text-sm">
                  {subjectQuery.data?.description}
                </p>
              </div>
            )}
          </div>
        </div>
        <div className="col-span-9">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-medium">Chapters</h1>
            <Button onClick={() => onAdd(id, subjectId)}>
              Ajouter un chapitre
            </Button>
          </div>

          {data && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {data?.map((chapter) => (
                <Card key={chapter.id}>
                  <CardHeader>
                    <CardTitle>{chapter.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>{chapter.description}</CardDescription>
                  </CardContent>
                  <CardFooter>
                    <div className="flex justify-end">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button size="icon" variant={"outline"} className="mr-2">
                              <Eye size={20} />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <span>View</span>
                          </TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button onClick={()=>setChapter(chapter,id)} size="icon" className="mr-2">
                              <Pencil size={20} />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <span>Edit</span>
                          </TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button size="icon" variant={"destructive"}>
                              <Trash2 size={20} />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <span>Delete</span>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default SubjectChapters;
