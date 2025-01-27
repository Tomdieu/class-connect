"use client";
import React, { useEffect, useState } from "react";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Credenza,
  CredenzaContent,
  CredenzaHeader,
  CredenzaTitle,
} from "@/components/ui/credenza";

import { useI18n } from "@/locales/client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addChapter, updateChapter } from "@/actions/courses";
import { toast } from "sonner";
import { Loader, TriangleAlert } from "lucide-react";
import { useChapterStore } from "@/hooks/chapter-store";

function ChapterModal() {
  const t = useI18n();
  const { isOpen,onClose,chapter,classId,subjectId } = useChapterStore();
  const [isLoading, setIsLoading] = useState(false);

  const createChapterSchema = (t: (key: string) => string) =>
    z.object({
      id: z.number().optional(),
      title: z.string(),
      description: z.string().optional(),
      order: z.number().default(0).optional(),
    });

  type ChapterFormData = z.infer<ReturnType<typeof createChapterSchema>>;

  const form = useForm<ChapterFormData>({
    resolver: zodResolver(createChapterSchema(t)),
    mode: "all",
    defaultValues: {
      title: "",
      description: "",
    },
  });

  const addChapterMutation = useMutation({
    mutationFn: addChapter,
  });

  const updateChapterMutation = useMutation({
    mutationFn: updateChapter,
  });

  const queryClient = useQueryClient();

  useEffect(() => {
    setIsLoading(
      addChapterMutation.isPending || updateChapterMutation.isPending
    );
  }, [addChapterMutation.isPending, updateChapterMutation.isPending]);

  useEffect(() => {
    if (chapter) {
      form.reset({
        title: chapter.title,
        description: chapter.description || "",
        id: chapter.id,
      });
    }
  }, [form, chapter]);

  const resetForm = () => {
    form.reset({
      id: undefined,
      title: undefined,
      description: undefined,
    });
  };

  const handleSubjectSubmit = async (data: ChapterFormData) => {
    console.log(data);

    if (chapter && classId && subjectId) {
      // Update
      updateChapterMutation.mutate(
        {
          class_pk: classId,
          chapter_pk: chapter.id,
          subject_pk: subjectId,
          body: {
            title: data.title,
            description: data.description || "",
          },
        },
        {
          onSuccess() {
            
            queryClient.invalidateQueries({
              queryKey: ["class", classId.toString(), "subjects",subjectId.toString(), "chapters"],
            });
            resetForm()
            onClose();
            toast.success("Updated Chapter", {
                description: "Chapter updated successfully",
              });
          },
          onError(error) {
            toast.error("An error occur", {
              description: error.message,
              icon: <TriangleAlert />,
            });
          },
        }
      );
    } else {
      // Create
      if (classId && subjectId) {
        addChapterMutation.mutate(
          {
            class_pk: classId,
            body: {
              title: data.title,
              description: data.description || "",
              subject: subjectId!,
              order: 0,
            },
            subject_pk: subjectId!,
          },
          {
            onSuccess() {
              onClose();
              queryClient.invalidateQueries({
                queryKey: ["class", classId.toString(), "subjects",subjectId?.toString(), "chapters"],
              });
              resetForm()
              toast.success("Added Chapter", {
                description: "Chapter added successfully",
              });
            },
            onError(error) {
              toast.error("An error occur", {
                description: error.message,
                icon: <TriangleAlert />,
              });
            },
          }
        );
      }
    }
  };

  return (
    <Credenza open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <CredenzaContent>
        <CredenzaHeader>
          <CredenzaTitle>
            {chapter ? "Modifier" : "Ajouter un chapitre"}
          </CredenzaTitle>
          <p className="text-sm text-muted-foreground">
            Remplir les informations pour {chapter ? "modifier" : "ajouter"} un
            chapitre
          </p>
        </CredenzaHeader>
        <div>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubjectSubmit)}
              className="flex flex-col gap-2 w-full"
            >
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel>Titre</FormLabel>
                    <FormControl>
                      <Input placeholder={"Titre du chapitre"} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        rows={5}
                        className="resize-none"
                        placeholder={"Description"}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                disabled={isLoading}
                className="flex items-center"
              >
                {isLoading && (
                  <Loader className="size-4 text-muted-foreground mr-2" />
                )}{" "}
                {chapter ? "Modifier" : "Ajouter"}
              </Button>
            </form>
          </Form>
        </div>
      </CredenzaContent>
    </Credenza>
  );
}

export default ChapterModal;
