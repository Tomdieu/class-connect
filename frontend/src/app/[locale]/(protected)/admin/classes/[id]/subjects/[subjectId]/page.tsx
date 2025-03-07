"use client";
import { getSubject, listChapters, deleteChapter } from '@/actions/courses';
import { Button } from '@/components/ui/button';
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
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { useChapterStore } from '@/hooks/chapter-store';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ChapterType } from '@/types';
import { useI18n } from '@/locales/client';
import { Book, Eye, Loader, Pencil, Plus, Trash2 } from 'lucide-react';
import { useParams } from 'next/navigation';
import React, { useState } from 'react';
import Link from "next/link";
import DeleteConfirmationModal from '@/components/modals/DeleteConfirmationModal';
import { toast } from 'sonner';

function SubjectDetailPage() {
  const { id, subjectId } = useParams<{ id: string; subjectId: string }>();
  const t = useI18n();
  const { onAdd, setChapter } = useChapterStore();
  const [chapterToDelete, setChapterToDelete] = useState<ChapterType | null>(null);
  const queryClient = useQueryClient();

  // Fetch subject details
  const subjectQuery = useQuery({
    queryKey: ["class", id, "subjects", subjectId],
    queryFn: () => getSubject({ class_pk: id, subject_pk: subjectId }),
  });

  // Fetch chapters for this subject
  const chaptersQuery = useQuery({
    queryKey: ["subject", subjectId, "chapters"],
    queryFn: () => listChapters({ class_pk: id, subject_pk: subjectId }),
    enabled: !!subjectQuery.data,
  });

  // Delete chapter mutation
  const deleteChapterMutation = useMutation({
    mutationFn: deleteChapter,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subject", subjectId, "chapters"] });
      toast.success(t("chapter.delete.success"));
      setChapterToDelete(null);
    },
    onError: (error) => {
      toast.error(t("chapter.delete.error"), {
        description: error.message,
      });
    },
  });

  const handleDeleteChapter = (chapter: ChapterType) => {
    setChapterToDelete(chapter);
  };

  const handleConfirmDelete = () => {
    if (chapterToDelete) {
      deleteChapterMutation.mutate({
        class_pk: id,
        subject_pk: subjectId,
        chapter_pk: chapterToDelete.id.toString(),
      });
    }
  };

  // Show loading state
  if (subjectQuery.isLoading || chaptersQuery.isLoading) {
    return (
      <div className="container flex justify-center items-center h-screen">
        <Loader className="animate-spin size-8" />
      </div>
    );
  }

  // Show error state
  if (subjectQuery.isError) {
    return (
      <div className="container flex justify-center items-center h-screen">
        <div
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
          role="alert"
        >
          <strong className="font-bold">{t("error")}: </strong>
          <span className="block sm:inline">{subjectQuery.error.message}</span>
        </div>
      </div>
    );
  }

  if (chaptersQuery.isError) {
    return (
      <div className="container flex justify-center items-center h-screen">
        <div
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
          role="alert"
        >
          <strong className="font-bold">{t("error")}: </strong>
          <span className="block sm:inline">{chaptersQuery.error.message}</span>
        </div>
      </div>
    );
  }

  const subject = subjectQuery.data;
  const chapters = chaptersQuery.data || [];

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
              <BreadcrumbLink href={`/admin/classes/${id}/subjects`}>
                {subject?.class_level}
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{subject?.name}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="flex flex-col gap-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Book className="size-6" />
              <h1 className="text-2xl font-semibold">{t("chapter.title")}</h1>
            </div>
            <Button 
              onClick={() => subject && onAdd(id,subjectId)}
            >
              <Plus className="size-4 mr-2" />
              {t("chapter.add")}
            </Button>
          </div>

          {chapters.length > 0 ? (
            <div className="grid sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-5">
              {chapters.map((chapter) => (
                <Card key={chapter.id} className="group hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Book className="size-5" />
                      {chapter.title}
                    </CardTitle>
                    {chapter.description && (
                      <CardDescription className="line-clamp-2">
                        {chapter.description}
                      </CardDescription>
                    )}
                  </CardHeader>
                  {/* <CardContent>
                    <p className="text-sm text-muted-foreground">
                      {t("chapter.order")}: {chapter.order}
                    </p>
                  </CardContent> */}
                  <CardFooter className="justify-between">
                    <TooltipProvider>
                      <div className="flex items-center gap-2">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => setChapter(chapter,id)}
                            >
                              <Pencil className="size-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>{t("chapter.edit")}</TooltipContent>
                        </Tooltip>

                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="icon"
                              onClick={() => handleDeleteChapter(chapter)}
                            >
                              <Trash2 className="size-4 text-destructive" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>{t("chapter.delete")}</TooltipContent>
                        </Tooltip>
                      </div>
                    </TooltipProvider>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Link href={`/admin/classes/${id}/subjects/${subjectId}/chapters/${chapter.id}/topics`}>
                          <Button variant="default">
                            <Eye className="size-4 mr-2" />
                            {t("chapter.topics")}
                          </Button>
                        </Link>
                      </TooltipTrigger>
                      <TooltipContent>{t("topic.viewTooltip")}</TooltipContent>
                    </Tooltip>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Book className="size-12 text-gray-300 mb-2" />
              <h3 className="text-xl font-medium mb-1">{t("chapter.empty")}</h3>
              <p className="text-gray-500 mb-4">{t("chapter.noChapters")}</p>
              <Button onClick={() => subject && onAdd(id,subjectId)}>
                <Plus className="size-4 mr-2" />
                {t("chapter.add")}
              </Button>
            </div>
          )}
        </div>
      </div>

      <DeleteConfirmationModal
        isOpen={!!chapterToDelete}
        onClose={() => setChapterToDelete(null)}
        onConfirm={handleConfirmDelete}
        title={t("chapter.delete.title")}
        description={t("chapter.delete.description")}
        isLoading={deleteChapterMutation.isPending}
      />
    </>
  );
}

export default SubjectDetailPage;