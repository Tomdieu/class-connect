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
import { useSubjectStore } from "@/hooks/subject-store";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addSubject, updateSubject } from "@/actions/courses";
import { toast } from "sonner";
import { Loader, TriangleAlert } from "lucide-react";

function SubjectModal() {
  const t = useI18n();
  const { isOpen, subject, onClose, classId } = useSubjectStore();
  const [isLoading, setIsLoading] = useState(false);

  const createSubjectSchema = (t: (key: string) => string) =>
    z.object({
      id: z.number().optional(),
      name: z.string(),
      description: z.string().optional(),
      // class_level: z.number(),
    });

  type SubjectFormData = z.infer<ReturnType<typeof createSubjectSchema>>;

  const form = useForm<SubjectFormData>({
    resolver: zodResolver(createSubjectSchema(t)),
    mode: "all",
    defaultValues: {
      name: "",
      description: "",
    },
  });

  const addSubjectMutation = useMutation({
    mutationFn: addSubject,
  });

  const updateSubjectMutation = useMutation({
    mutationFn: updateSubject,
  });

  const queryClient = useQueryClient();

  useEffect(() => {
    setIsLoading(
      addSubjectMutation.isPending || updateSubjectMutation.isPending
    );
  }, [addSubjectMutation.isPending, updateSubjectMutation.isPending]);

  useEffect(() => {
    if (subject) {
      form.reset({
        name: subject.name,
        description: subject.description || "",
        // class_level: subject.class_level,
        id: subject.id,
      });
    }
  }, [form, subject]);

  const resetForm = () => {
    form.reset({
      id: undefined,
      name: undefined,
      description: undefined,
    });
  };

  // useEffect(()=>{
  //   if(classId){
  //     form.setValue("class_level",classId)
  //   }
  // },[classId, form])

  const handleSubjectSubmit = async (data: SubjectFormData) => {
    console.log(data);

    if (subject) {
      // Update
      updateSubjectMutation.mutate(
        {
          class_pk: subject.class_level,
          subject_pk: subject.id,
          body: {
            name: data.name,
            description: data.description || "",
          },
        },
        {
          onSuccess() {
            queryClient.invalidateQueries({
              queryKey: ["class", subject.class_level.toString(), "subjects"],
            });
            queryClient.invalidateQueries({
              queryKey: ["class", subject.class_level.toString()],
            });
            resetForm()
            onClose();
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
      if (classId) {
        addSubjectMutation.mutate(
          {
            class_pk: classId,
            body: {
              name: data.name,
              description: data.description || "",
              class_level: classId!,
            },
          },
          {
            onSuccess() {
              onClose();
              queryClient.invalidateQueries({
                queryKey: ["class", classId.toString(), "subjects"],
              });
              queryClient.invalidateQueries({
                queryKey: ["class", classId.toString()],
              });
              resetForm()
              toast.success("Added Subject", {
                description: "Subject added successfully",
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
            {subject ? "Modifier" : "Ajouter une matier"}
          </CredenzaTitle>
          <p className="text-sm text-muted-foreground">
            Remplir les informations pour {subject ? "modifier" : "ajouter"} une
            matier
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
                name="name"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel>Nom de la matier</FormLabel>
                    <FormControl>
                      <Input placeholder={"Nom de la matier"} {...field} />
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
                {subject ? "Modifier" : "Ajouter"}
              </Button>
            </form>
          </Form>
        </div>
      </CredenzaContent>
    </Credenza>
  );
}

export default SubjectModal;
