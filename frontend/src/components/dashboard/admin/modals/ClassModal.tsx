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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { useI18n } from "@/locales/client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addClass, updateClass } from "@/actions/courses";
import { toast } from "sonner";
import { Loader, TriangleAlert } from "lucide-react";
import { useClassStore } from "@/hooks/class-store";
import { EDUCATION_LEVELS, SECTIONS, LYCEE_SPECIALITIES } from "@/constants";

function ClassModal() {
  const t = useI18n();
  const { isOpen, onClose, class: classData } = useClassStore();
  const [isLoading, setIsLoading] = useState(false);

  const createClassSchema = (t: (key: string) => string) =>
    z.object({
      id: z.number().optional(),
      name: z.string().min(3),
      description: z.string().optional(),
      level: z.enum(EDUCATION_LEVELS),
      section: z.enum(SECTIONS),
      speciality: z.enum(LYCEE_SPECIALITIES).optional().refine(
        (val, ctx) => {
          if (ctx.parent.level === "LYCEE" && !val) {
            return false;
          }
          return true;
        },
        {
          message: "Speciality is required for LYCEE level",
        }
      ),
    });

  type ClassFormData = z.infer<ReturnType<typeof createClassSchema>>;

  const form = useForm<ClassFormData>({
    resolver: zodResolver(createClassSchema(t)),
    mode: "all",
    defaultValues: {
      name: "",
      description: "",
      level: "LYCEE",
      section: "FRANCOPHONE",
      speciality: undefined,
    },
  });

  const addClassMutation = useMutation({
    mutationFn: addClass,
  });

  const updateClassMutation = useMutation({
    mutationFn: updateClass,
  });

  const queryClient = useQueryClient();

  useEffect(() => {
    setIsLoading(addClassMutation.isPending || updateClassMutation.isPending);
  }, [addClassMutation.isPending, updateClassMutation.isPending]);

  useEffect(() => {
    if (classData) {
      form.reset({
        name: classData.name,
        description: classData.description || "",
        id: classData.id,
        level: classData.level,
        section: classData.section,
        speciality: classData.speciality,
      });
    }
  }, [form, classData]);

  const resetForm = useCallback(() => {
    form.reset({
      id: undefined,
      name: "",
      description: "",
      level: "LYCEE",
      section: "FRANCOPHONE",
      speciality: undefined,
    });
  }, [form]);

  useEffect(() => {
    if (!isOpen) {
      resetForm();
    }
  }, [isOpen, resetForm]);

  const handleClassSubmit = async (data: ClassFormData) => {
    if (classData) {
      // Update
      updateClassMutation.mutate(
        {
          id: classData.id,
          body: {
            name: data.name,
            description: data.description || "",
            level: data.level,
            section: data.section,
            speciality: data.speciality,
          },
        },
        {
          onSuccess() {
            queryClient.invalidateQueries({
              queryKey: ["classes"],
            });
            resetForm();
            onClose();
            toast.success("Updated Class", {
              description: "Class updated successfully",
            });
          },
          onError(error) {
            toast.error("An error occurred", {
              description: error.message,
              icon: <TriangleAlert />,
            });
          },
        }
      );
    } else {
      // Create
      addClassMutation.mutate(
        {
          body: {
            name: data.name,
            description: data.description || "",
            level: data.level,
            section: data.section,
            speciality: data.speciality,
          },
        },
        {
          onSuccess() {
            onClose();
            queryClient.invalidateQueries({
              queryKey: ["classes"],
            });
            resetForm();
            toast.success("Added Class", {
              description: "Class added successfully",
            });
          },
          onError(error) {
            toast.error("An error occurred", {
              description: error.message,
              icon: <TriangleAlert />,
            });
          },
        }
      );
    }
  };

  return (
    <Credenza open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <CredenzaContent>
        <CredenzaHeader>
          <CredenzaTitle>
            {classData ? "Modifier" : "Ajouter une classe"}
          </CredenzaTitle>
          <p className="text-sm text-muted-foreground">
            Remplir les informations pour {classData ? "modifier" : "ajouter"} une
            classe
          </p>
        </CredenzaHeader>
        <div>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleClassSubmit)}
              className="flex flex-col gap-2 w-full"
            >
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel>Nom</FormLabel>
                    <FormControl>
                      <Input placeholder="Nom de la classe" {...field} />
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
                        placeholder="Description"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="level"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel>Niveau</FormLabel>
                    <Select
                      onValueChange={(value) => {
                        field.onChange(value);
                        if (value !== "LYCEE") {
                          form.setValue("speciality", undefined);
                        }
                      }}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner un niveau" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {EDUCATION_LEVELS.map((level) => (
                          <SelectItem key={level} value={level}>
                            {level}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {form.watch("level") === "LYCEE" && (
                <FormField
                  control={form.control}
                  name="speciality"
                  render={({ field }) => (
                    <FormItem className="w-full">
                      <FormLabel>Spécialité</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionner une spécialité" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {LYCEE_SPECIALITIES.map((speciality) => (
                            <SelectItem key={speciality} value={speciality}>
                              {speciality}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              <FormField
                control={form.control}
                name="section"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel>Section</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner une section" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {SECTIONS.map((section) => (
                          <SelectItem key={section} value={section}>
                            {section}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
                {classData ? "Modifier" : "Ajouter"}
              </Button>
            </form>
          </Form>
        </div>
      </CredenzaContent>
    </Credenza>
  );
}

export default ClassModal;