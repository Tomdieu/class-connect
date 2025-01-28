"use client";
import React, { useCallback, useEffect, useState } from "react";
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
import { addTopic, updateTopic } from "@/actions/courses";
import { toast } from "sonner";
import { Loader, TriangleAlert } from "lucide-react";
import { useTopicStore } from "@/hooks/topic-store";

function TopicModal() {
  const t = useI18n();
  const { isOpen,onClose,topic,classId,subjectId,chapterId } = useTopicStore();
  const [isLoading, setIsLoading] = useState(false);

  const createTopicSchema = (t: (key: string) => string) =>
    z.object({
      id: z.number().optional(),
      title: z.string().min(3),
      description: z.string().optional(),
      order: z.number().default(0).optional(),
    });

  type TopicFormData = z.infer<ReturnType<typeof createTopicSchema>>;

  const form = useForm<TopicFormData>({
    resolver: zodResolver(createTopicSchema(t)),
    mode: "all",
    defaultValues: {
      title: "",
      description: "",
    },
  });

  const addTopicMutation = useMutation({
    mutationFn: addTopic,
  });

  const updateTopicMutation = useMutation({
    mutationFn: updateTopic,
  });

  const queryClient = useQueryClient();

  useEffect(() => {
    setIsLoading(
      addTopicMutation.isPending || updateTopicMutation.isPending
    );
  }, [addTopicMutation.isPending, updateTopicMutation.isPending]);

  useEffect(() => {
    if (topic) {
      form.reset({
        title: topic.title,
        description: topic.description || "",
        id: topic.id,
      });
    }
  }, [form, topic]);

  const resetForm = useCallback(() => {
      form.reset({
        id: undefined,
        title: undefined,
        description: undefined,
      });
    },[form]);
  
    useEffect(()=>{
      if(!isOpen){
          resetForm()
      }
    },[isOpen, resetForm])

  const handleSubjectSubmit = async (data: TopicFormData) => {
    console.log(data);

    if (topic && classId && subjectId && chapterId) {
      // Update
      updateTopicMutation.mutate(
        {
            class_pk: classId,
            chapter_pk: chapterId,
            subject_pk: subjectId,
            body: {
                title: data.title,
                description: data.description || "",
            },
            topic_pk: topic.id
        },
        {
          onSuccess() {
            
            queryClient.invalidateQueries({
              queryKey: ["class", classId.toString(), "subjects",subjectId.toString(), "chapters"],
            });
            resetForm()
            onClose();
            toast.success("Updated topic", {
                description: "Topict updated successfully",
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
      if (classId && subjectId && chapterId) {
        addTopicMutation.mutate(
          {
              class_pk: classId,
              body: {
                  title: data.title,
                  description: data.description || "",
                  chapter: chapterId!,
                  order: 0,
              },
              subject_pk: subjectId!,
              chapter_pk: chapterId!
          },
          {
            onSuccess() {
              onClose();
              queryClient.invalidateQueries({
                queryKey: ["class", classId.toString(), "subjects",subjectId?.toString(), "chapters"],
              });
              resetForm()
              toast.success("Added Topic", {
                description: "Topic added successfully",
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
            {topic ? "Modifier" : "Ajouter une lecon"}
          </CredenzaTitle>
          <p className="text-sm text-muted-foreground">
            Remplir les informations pour {topic ? "modifier" : "ajouter"} une lecon
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
                {topic ? "Modifier" : "Ajouter"}
              </Button>
            </form>
          </Form>
        </div>
      </CredenzaContent>
    </Credenza>
  );
}

export default TopicModal;
