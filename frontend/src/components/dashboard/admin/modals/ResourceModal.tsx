"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import {
  Credenza,
  CredenzaContent,
  CredenzaHeader,
  CredenzaTitle,
} from "@/components/ui/credenza";
import {
  useExerciseStore,
  usePDFStore,
  useRevisionStore,
  useVideoStore,
} from "@/hooks/resources-store";
// import { QuestionField } from "./QuestionField";
import { FileDropzone } from "@/components/FileDropzone";
import { Loader2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  addExerciseResource,
  addPdfResource,
  addRevisionResource,
  updateExerciseResource,
  updatePdfResource,
  updateRevisionResource,
} from "@/actions/courses";
import { toast } from "sonner";
import axios from "axios";
import api from "@/services/api";
import { useSession } from "next-auth/react";
import { useI18n } from "@/locales/client";

// -------------------------
// Form Schemas
// -------------------------

const baseResourceSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  topic: z.number({
    required_error: "Topic is required",
    invalid_type_error: "Topic must be a number",
  }),
  polymorphic_ctype: z
    .number({
      required_error: "Content type is required",
      invalid_type_error: "Content type must be a number",
    })
    .optional(),
});

// const quizSchema = baseResourceSchema.extend({
//   duration_minutes: z.number().min(1, "Duration must be at least 1 minute"),
//   passing_score: z.number().min(0).max(100),
//   show_correct_answers: z.boolean(),
//   shuffle_questions: z.boolean(),
//   questions: z.array(
//     z.object({
//       text: z.string().min(1, "Question text is required"),
//       type: z.enum([
//         "MULTIPLE_CHOICE",
//         "SINGLE_CHOICE",
//         "TRUE_FALSE",
//         "SHORT_ANSWER",
//       ]),
//       points: z.number().min(1, "Points must be at least 1"),
//       order: z.number(),
//       explanation: z.string().optional(),
//       options: z
//         .array(
//           z.object({
//             text: z.string().min(1, "Option text is required"),
//             is_correct: z.boolean(),
//             order: z.number(),
//           })
//         )
//         .optional(), // Options may be optional for some question types
//     })
//   ),
// });

const pdfSchema = baseResourceSchema.extend({
  pdf_file: z.instanceof(File, {
    message: "PDF file is required",
  }),
});

const videoSchema = baseResourceSchema.extend({
  video_file: z.instanceof(File, {
    message: "Video file is required",
  }),
});

const exerciseSchema = baseResourceSchema.extend({
  instructions: z.string().min(1, "Instructions are required"),
  solution_file: z.instanceof(File).optional(),
  exercise_file: z.instanceof(File),
});

const revisionSchema = baseResourceSchema.extend({
  content: z.string().min(1, "Content is required"),
});

// -------------------------
// PDF Modal
// -------------------------

export const PDFModal = () => {
  const t = useI18n();
  const { isOpen, onClose, chapterId, classId, topicId, subjectId, resource } =
    usePDFStore();
  const [isLoading, setIsLoading] = useState(false);

  const addPdfMutation = useMutation({
    mutationFn: addPdfResource,
  });

  const updatePdfMutation = useMutation({
    mutationFn: updatePdfResource,
  });

  const queryClient = useQueryClient();

  useEffect(() => {
    setIsLoading(addPdfMutation.isPending);
  }, [addPdfMutation.isPending]);

  const form = useForm<z.infer<typeof pdfSchema>>({
    resolver: zodResolver(pdfSchema),
    defaultValues: {
      title: "",
      description: "",
    },
  });

  useEffect(() => {
    if (resource) {
      form.reset({
        title: resource.title,
        description: resource.description || "",
        topic: Number(topicId),
      });
    }
  }, [form, resource, topicId]);

  useEffect(() => {
    form.setValue("topic", Number(topicId));
  }, [form, topicId]);

  const resetForm = () => {
    form.reset({});
  };

  const onSubmit = async (data: z.infer<typeof pdfSchema>) => {
    try {
      console.log(form.formState.errors);
      console.log(!data.pdf_file);
      if (!data.pdf_file && !resource) {
        form.setError("pdf_file", { message: "PDF file is required" });
        return;
      }

      if (resource) {
        // Update existing PDF
        updatePdfMutation.mutate(
          {
            class_pk: classId!,
            subject_pk: subjectId!,
            chapter_pk: chapterId!,
            topic_pk: topicId!,
            resource_pk: resource.id,
            resource: data,
          },
          {
            onSuccess() {
              toast.success("Resource updated successfully");
              queryClient.invalidateQueries({
                queryKey: [
                  "class",
                  classId,
                  "subjects",
                  subjectId,
                  "chapters",
                  chapterId,
                  "topics",
                  topicId,
                  "resources",
                ],
              });
              handleClose();
            },
            onError(error) {
              toast.error("Failed to update resource", {
                description: error.message,
              });
            },
          }
        );
      } else {
        // Create new PDF
        if (chapterId && classId && subjectId && topicId) {
          addPdfMutation.mutate(
            {
              chapter_pk: chapterId!,
              class_pk: classId,
              resource: data,
              subject_pk: subjectId,
              topic_pk: topicId,
            },
            {
              onSuccess() {
                toast.success("Resource added successfully");
                queryClient.invalidateQueries({
                  queryKey: [
                    "class",
                    classId,
                    "subjects",
                    subjectId,
                    "chapters",
                    chapterId,
                    "topics",
                    topicId,
                    "resources",
                  ],
                });
                handleClose();
              },
              onError(error, variables, context) {
                console.log({ error, variables, context });
              },
            }
          );
        }
      }

      console.log("PDF form submitted:", data);
    } catch (error) {
      console.error("Error submitting PDF form:", error);
    }
  };

  const handleDrop = (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      form.setValue("pdf_file", acceptedFiles[0], { shouldValidate: true });
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Credenza open={isOpen} onOpenChange={handleClose}>
      <CredenzaContent className="sm:max-w-[600px] p-6 pb-16 transition-all duration-300">
        <CredenzaHeader className="mt-5">
          <CredenzaTitle>
            {resource ? t("resource.modal.pdf.edit") : t("resource.modal.pdf.title")}
          </CredenzaTitle>
        </CredenzaHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Base fields */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem className="transition-all duration-300">
                  <FormLabel>{t("resource.modal.title")}</FormLabel>
                  <FormControl>
                    <Input placeholder={t("resource.modal.title")} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem className="transition-all duration-300">
                  <FormLabel>{t("resource.modal.description")}</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={t("resource.modal.description")}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="pdf_file"
              render={() => (
                <FormItem className="transition-all duration-300">
                  <FormLabel>{t("resource.modal.file.pdf")}</FormLabel>
                  {resource && (
                    <a 
                      href={resource.pdf_file}
                      target="_blank"
                      rel="noopener noreferrer" 
                      className="text-sm text-blue-600 hover:underline block mb-2"
                    >
                      {t("resource.modal.file.current")}
                    </a>
                  )}
                  <FormControl>
                    <FileDropzone
                      onDrop={handleDrop}
                      accept={{
                        "application/pdf": [".pdf"],
                      }}
                      label={t("resource.modal.file.dropzone.pdf")}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading && (
                <Loader2 className="size-4 mr-2 text-white animate-spin" />
              )}
              {t("resource.modal.submit.pdf")}
            </Button>
          </form>
        </Form>
      </CredenzaContent>
    </Credenza>
  );
};

// -------------------------
// Exercise Modal
// -------------------------

export const ExerciseModal = () => {
  const t = useI18n();
  const { isOpen, onClose, classId, subjectId, chapterId, topicId, resource } =
    useExerciseStore();

  const [isLoading, setIsLoading] = useState(false);

  const addExerciceMutation = useMutation({
    mutationFn: addExerciseResource,
  });

  const updateExerciceMutation = useMutation({
    mutationFn: updateExerciseResource,
  });

  useEffect(() => {
    setIsLoading(addExerciceMutation.isPending || updateExerciceMutation.isPending);
  }, [addExerciceMutation.isPending, updateExerciceMutation.isPending]);
  

  const queryClient = useQueryClient();

  const form = useForm<z.infer<typeof exerciseSchema>>({
    resolver: zodResolver(exerciseSchema),
    defaultValues: {
      title: "",
      description: "",
      topic: 0,
      polymorphic_ctype: 0,
      instructions: "",
    },
  });

  useEffect(() => {
    if (resource) {
      form.reset({
        title: resource.title,
        description: resource.description || "",
        instructions: resource.instructions || "",
        topic: Number(topicId),
      });
    }
  }, [form, resource, topicId]);

  useEffect(() => {
    form.setValue("topic", Number(topicId));
  }, [form, topicId]);

  const resetForm = () => {
    form.reset({});
  };

  const onSubmit = async (data: z.infer<typeof exerciseSchema>) => {
    try {
      console.log("Exercise form submitted:", data);
      if (resource) {
        // Update existing exercise
        const formData = new FormData();
        formData.append("topic", `${topicId}`);
        formData.append("title", data.title);
        formData.append("description", data.description || "");
        formData.append("instructions", data.instructions);
        if (data.exercise_file) {
          formData.append("exercise_file", data.exercise_file);
        }
        if (data.solution_file) {
          formData.append("solution_file", data.solution_file);
        }

        updateExerciceMutation.mutate(
          {
            class_pk: classId!,
            subject_pk: subjectId!,
            chapter_pk: chapterId!,
            topic_pk: topicId!,
            resource_pk: resource.id,
            resource: data,
          },
          {
            onSuccess(data) {
              console.log(data);
              toast.success("Resource updated successfully", {
                description: "exercise updated successfully",
              });
              queryClient.invalidateQueries({
                queryKey: [
                  "class",
                  classId,
                  "subjects",
                  subjectId,
                  "chapters",
                  chapterId,
                  "topics",
                  topicId,
                  "resources",
                ],
              });
              handleClose();
            },
            onError(error, variables, context) {
              console.log({ error, variables, context });
            },
          }
        );
      } else {
        // Create new exercise
        if (chapterId && classId && subjectId && topicId) {
          addExerciceMutation.mutate(
            {
              chapter_pk: chapterId!,
              class_pk: classId,
              resource: data,
              subject_pk: subjectId,
              topic_pk: topicId,
            },
            {
              onSuccess() {
                toast.success("Resource added successfully", {
                  description: "exercise added successfully",
                });
                queryClient.invalidateQueries({
                  queryKey: [
                    "class",
                    classId,
                    "subjects",
                    subjectId,
                    "chapters",
                    chapterId,
                    "topics",
                    topicId,
                    "resources",
                  ],
                });
                handleClose();
              },
              onError(error, variables, context) {
                console.log({ error, variables, context });
              },
            }
          );
        }
      }
    } catch (error) {
      console.error("Error submitting exercise form:", error);
    }
  };

  const handleDrop =
    (fieldName: "solution_file" | "exercise_file") =>
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        form.setValue(fieldName, acceptedFiles[0], { shouldValidate: true });
      }
    };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Credenza open={isOpen} onOpenChange={handleClose}>
      <CredenzaContent className="sm:max-w-[500px] h-full sm:h-auto max-h-screen sm:max-h-[90vh]">
        <div className="space-y-6 overflow-y-auto">
          <CredenzaHeader>
            <CredenzaTitle>
              {resource ? t("resource.modal.exercise.edit") : t("resource.modal.exercise.title")}
            </CredenzaTitle>
          </CredenzaHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("resource.modal.title")}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t("resource.modal.title")}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("resource.modal.description")}</FormLabel>
                    <FormControl>
                      <Textarea
                        rows={5}
                        className="resize-none"
                        {...field}
                        placeholder={t("resource.modal.description")}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="instructions"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("resource.modal.instructions")}</FormLabel>
                    <FormControl>
                      <Textarea
                        rows={5}
                        className="resize-none"
                        {...field}
                        placeholder={t("resource.modal.instructions")}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="exercise_file"
                render={() => (
                  <FormItem>
                    <FormLabel>{t("resource.modal.file.exercise")}</FormLabel>
                    {resource && (
                      <a 
                        href={resource.exercise_file}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:underline block mb-2"
                      >
                        {t("resource.modal.file.current")}
                      </a>
                    )}
                    <FormControl>
                      <FileDropzone
                        onDrop={handleDrop("exercise_file")}
                        label={t("resource.modal.file.dropzone.exercise")}
                        accept={{
                          "application/pdf": [".pdf"],
                          "application/msword": [".doc"],
                          "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
                            [".docx"],
                          "image/*": [".png", ".jpg", ".jpeg", ".gif"],
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="solution_file"
                render={() => (
                  <FormItem>
                    <FormLabel>{t("resource.modal.file.solution")}</FormLabel>
                    {resource?.solution_file && (
                      <a 
                        href={resource.solution_file}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:underline block mb-2"
                      >
                        {t("resource.modal.file.current")}
                      </a>
                    )}
                    <FormControl>
                      <FileDropzone
                        onDrop={handleDrop("solution_file")}
                        label={t("resource.modal.file.dropzone.solution")}
                        accept={{
                          "application/pdf": [".pdf"],
                          "application/msword": [".doc"],
                          "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
                            [".docx"],
                          "image/*": [".png", ".jpg", ".jpeg", ".gif"],
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <Loader2 className="size-4 mr-2 text-white animate-spin" />
                    <span>{t("resource.modal.submit.exercise")}</span>
                  </div>
                ) : (
                  t("resource.modal.submit.exercise")
                )}
              </Button>
            </form>
          </Form>
        </div>
      </CredenzaContent>
    </Credenza>
  );
};

// -------------------------
// Revision Modal
// -------------------------

export const RevisionModal = () => {
  const t = useI18n();
  const {
    isOpen,
    onClose,
    classId,
    subjectId,
    chapterId,
    topicId,
    resource,
  } = useRevisionStore();

  const [isLoading, setIsLoading] = useState(false);

  const addRevisionMutation = useMutation({
    mutationFn: addRevisionResource,
  });

  const updateRevisionMutation = useMutation({
      mutationFn: updateRevisionResource,
    });

  useEffect(() => {
    setIsLoading(addRevisionMutation.isPending || updateRevisionMutation.isPending);
  }, [addRevisionMutation.isPending, updateRevisionMutation.isPending]);

  const queryClient = useQueryClient();

  const form = useForm<z.infer<typeof revisionSchema>>({
    resolver: zodResolver(revisionSchema),
    defaultValues: {
      title: "",
      description: "",
      topic: 0,
      polymorphic_ctype: 0,
      content: "",
    },
  });

  useEffect(() => {
    if (resource) {
      form.reset({
        title: resource.title,
        description: resource.description || "",
        content: resource.content || "",
        topic: Number(topicId),
      });
    }
  }, [form, resource, topicId]);

  useEffect(() => {
    form.setValue("topic", Number(topicId));
  }, [form, topicId]);

  const resetForm = () => {
    form.reset({});
  };

  const onSubmit = async (data: z.infer<typeof revisionSchema>) => {
    try {
      console.log("Revision form submitted:", data);
      if (resource) {
        // Update existing revision
        updateRevisionMutation.mutate({
          class_pk: classId!,
          subject_pk: subjectId!,
          chapter_pk: chapterId!,
          topic_pk: topicId!,
          resource_pk: resource.id,
          resource: data,
        },{
          onSuccess(data) {
            console.log(data);
            toast.success("Resource updated successfully", {
              description: "revision updated successfully",
            });
            queryClient.invalidateQueries({
              queryKey: [
                "class",
                classId,
                "subjects",
                subjectId,
                "chapters",
                chapterId,
                "topics",
                topicId,
                "resources",
              ],
            });
            resetForm();
            handleClose();
          },
          onError(error, variables, context) {
            console.log({ error, variables, context });
          }
        })
      } else {
        // Create new revision
        if (chapterId && classId && subjectId && topicId) {
          addRevisionMutation.mutate(
            {
              chapter_pk: chapterId!,
              class_pk: classId,
              resource: data,
              subject_pk: subjectId,
              topic_pk: topicId,
            },
            {
              onSuccess() {
                toast.success("Resource added successfully", {
                  description: "revision added successfully",
                });
                queryClient.invalidateQueries({
                  queryKey: [
                    "class",
                    classId,
                    "subjects",
                    subjectId,
                    "chapters",
                    chapterId,
                    "topics",
                    topicId,
                    "resources",
                  ],
                });
                resetForm();
                handleClose();
              },
              onError(error, variables, context) {
                console.log({ error, variables, context });
              },
            }
          );
        }
      }
    } catch (error) {
      console.error("Error submitting revision form:", error);
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Credenza open={isOpen} onOpenChange={handleClose}>
      <CredenzaContent className="sm:max-w-[600px] p-5 pb-5 transition-all duration-300">
        <div className="space-y-4 overflow-y-auto">
          <CredenzaHeader className="mt-5">
            <CredenzaTitle>
              {resource ? t("resource.modal.revision.edit") : t("resource.modal.revision.title")}
            </CredenzaTitle>
          </CredenzaHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Base fields */}
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem className="transition-all duration-300">
                    <FormLabel>{t("resource.modal.title")}</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder={t("resource.modal.title")}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem className="transition-all duration-300">
                    <FormLabel>{t("resource.modal.description")}</FormLabel>
                    <FormControl>
                      <Textarea
                        rows={4}
                        {...field}
                        placeholder={t("resource.modal.description")}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem className="transition-all duration-300">
                    <FormLabel>{t("resource.modal.content")}</FormLabel>
                    <FormControl>
                      <Textarea
                        rows={7}
                        {...field}
                        placeholder={t("resource.modal.content")}
                      />
                      {/* <MdEditor value={field.value} onChange={field.onChange}/> */}
                    </FormControl>
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full">
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <Loader2 className="size-4 mr-2 text-white animate-spin" />
                    <span>{t("resource.modal.submit.revision")}</span>
                  </div>
                ) : (
                  t("resource.modal.submit.revision")
                )}
              </Button>
            </form>
          </Form>
        </div>
      </CredenzaContent>
    </Credenza>
  );
};

// -------------------------
// Video Modal
// -------------------------

export const VideoModal = () => {
  const t = useI18n();
  const {
    isOpen,
    onClose,
    classId,
    subjectId,
    chapterId,
    topicId,
    resource,
  } = useVideoStore();
  const { data: session } = useSession();
  const queryClient = useQueryClient();

  const [isLoading, setIsLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Move form initialization before any useEffect that uses it
  const form = useForm<z.infer<typeof videoSchema>>({
    resolver: zodResolver(videoSchema),
    defaultValues: {
      title: "",
      description: "",
      topic: 0,
      polymorphic_ctype: 0,
    },
  });

  const addVideoMutation = useMutation({
    mutationFn: async (data: z.infer<typeof videoSchema>) => {
      try {
        if (chapterId && classId && subjectId && topicId) {
          console.log({ session });
          const formData = new FormData();
          formData.append("topic", `${topicId}`);
          formData.append("title", data.title);
          formData.append("description", data.description || "");
          formData.append("video_file", data.video_file);

          const res = await api.post(
            `/api/classes/${classId}/subjects/${subjectId}/chapters/${chapterId}/topics/${topicId}/videos/`,
            formData,
            {
              headers: {
                Authorization: `Bearer ${session?.user.accessToken}`,
              },
              onUploadProgress: (progressEvent) => {
                const percentCompleted = Math.round(
                  (progressEvent.loaded * 100) / progressEvent.total!
                );
                setUploadProgress(percentCompleted);
              },
            }
          );
          return res.data;
        }
      } catch (error) {
        if (axios.isAxiosError(error)) {
          if (error.response && error.response.data) {
            throw error.response.data;
          }
        }
        throw error;
      }
    },
  });

  useEffect(() => {
    if (resource) {
      form.reset({
        title: resource.title,
        description: resource.description || "",
        topic: Number(topicId),
      });
    }
  }, [form, resource, topicId]);

  useEffect(() => {
    setIsLoading(addVideoMutation.isPending);
  }, [addVideoMutation.isPending]);

  useEffect(() => {
    form.setValue("topic", Number(topicId));
  }, [form, topicId]);

  const resetForm = useCallback(() => {
    form.reset({});
    setUploadProgress(0);
  },[form]);

  useEffect(()=>{
    if(!isOpen){
      resetForm()
    }
  },[isOpen, resetForm])

  const onSubmit = async (data: z.infer<typeof videoSchema>) => {
    try {
      if (!data.video_file && !resource) {
        form.setError("video_file", { message: "Video file is required" });
        return;
      }

      if (resource) {
        // Update existing video
        const formData = new FormData();
        formData.append("topic", `${topicId}`);
        formData.append("title", data.title);
        formData.append("description", data.description || "");
        if (data.video_file) {
          formData.append("video_file", data.video_file);
        }

        const res = await api.patch(
          `/api/classes/${classId}/subjects/${subjectId}/chapters/${chapterId}/topics/${topicId}/videos/${resource.id}/`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${session?.user.accessToken}`,
            },
            onUploadProgress: (progressEvent) => {
              const percentCompleted = Math.round(
                (progressEvent.loaded * 100) / progressEvent.total!
              );
              setUploadProgress(percentCompleted);
            },
          }
        );
        // Handle success
        toast.success("Video updated successfully");
        queryClient.invalidateQueries({
          queryKey: [
            "class",
            classId,
            "subjects",
            subjectId,
            "chapters",
            chapterId,
            "topics",
            topicId,
            "resources",
          ],
        });
        resetForm()
        handleClose();
      } else {
        // Create new video
        try {
          const formData = new FormData();
          formData.append("topic", `${topicId}`);
          formData.append("title", data.title);
          formData.append("description", data.description || "");
          formData.append("video_file", data.video_file);

          const res = await api.post(
            `/api/classes/${classId}/subjects/${subjectId}/chapters/${chapterId}/topics/${topicId}/videos/`,
            formData,
            {
              headers: {
                Authorization: `Bearer ${session?.user.accessToken}`,
              },
              onUploadProgress: (progressEvent) => {
                const percentCompleted = Math.round(
                  (progressEvent.loaded * 100) / progressEvent.total!
                );
                setUploadProgress(percentCompleted);
              },
            }
          );

          toast.success("Resource added successfully", {
            description: "Video added successfully",
          });
          queryClient.invalidateQueries({
            queryKey: [
              "class",
              classId,
              "subjects",
              subjectId,
              "chapters",
              chapterId,
              "topics",
              topicId,
              "resources",
            ],
          });
          resetForm()
          handleClose();
        } catch (error) {
          console.error("Error:", error);
          toast.error("Failed to upload video", {
            description: "Please try again",
          });
        }
      }
    } catch (error) {
      console.error("Error submitting video form:", error);
    }
  };

  const handleDrop = (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      form.setValue("video_file", acceptedFiles[0], { shouldValidate: true });
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Credenza
      open={isOpen}
      onOpenChange={() => {
        if (!isLoading) {
          handleClose();
        } else {
          toast.warning("Please wait for the video to upload");
        }
      }}
    >
      <CredenzaContent showIcon={!isLoading} className="p-4 sm:max-w-[500px]">
        <div className="">
          <CredenzaHeader>
            <CredenzaTitle>
              {resource ? t("resource.modal.video.edit") : t("resource.modal.video.title")}
            </CredenzaTitle>
          </CredenzaHeader>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="mt-2 space-y-6"
            >
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("resource.modal.title")}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t("resource.modal.title")}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("resource.modal.description")}</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder={t("resource.modal.description")}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="video_file"
                render={() => (
                  <FormItem>
                    <FormLabel>{t("resource.modal.file.video")}</FormLabel>
                    {resource && (
                      <a 
                        href={resource.video_file}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:underline block mb-2"
                      >
                        {t("resource.modal.file.current")}
                      </a>
                    )}
                    <FormControl>
                      <FileDropzone
                        onDrop={handleDrop}
                        accept={{
                          "video/*": [".mp4", ".webm", ".mov", ".avi"],
                        }}
                        label={t("resource.modal.file.dropzone.video")}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {isLoading && (
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
              )}

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <Loader2 className="size-4 mr-2 text-white animate-spin" />
                    <span>
                      {t("resource.modal.submit.video")} {uploadProgress}%
                    </span>
                  </div>
                ) : (
                  t("resource.modal.submit.video")
                )}
              </Button>
            </form>
          </Form>
        </div>
      </CredenzaContent>
    </Credenza>
  );
};
