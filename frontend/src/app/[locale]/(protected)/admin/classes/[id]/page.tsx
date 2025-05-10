"use client";
import { deleteSubject, getClass, listSubjects } from "@/actions/courses";
import { getStudentsByClass } from "@/actions/user-classes";
import { listSchoolYear } from "@/actions/enrollments";
import { useI18n } from "@/locales/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Book, Eye, Loader, Pencil, Plus, Trash2, Users } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
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
import { motion, AnimatePresence } from "framer-motion";
import { getUsers } from "@/actions/accounts";
import { createUserClass } from "@/actions/user-classes";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import {
  Credenza,
  CredenzaClose,
  CredenzaContent,
  CredenzaDescription,
  CredenzaFooter,
  CredenzaHeader,
  CredenzaTitle,
} from "@/components/ui/credenza";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CheckIcon,ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { deleteClass } from "@/actions/sections";

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 100, damping: 15 }
  }
};

const cardVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: { type: "spring", stiffness: 100, damping: 12 }
  },
  hover: { 
    scale: 1.02, 
    boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
    transition: { type: "spring", stiffness: 400, damping: 10 }
  }
};

// Form schema for adding a student to class
const addStudentSchema = z.object({
  user_id: z.string({
    required_error: "Please select a student",
  }),
});

type AddStudentFormValues = z.infer<typeof addStudentSchema>;

function ClassDetail() {
  const { id } = useParams<{ id: string }>();
  const t = useI18n();
  const { onAdd, setSubject } = useSubjectStore();
  const [subjectToDelete, setSubjectToDelete] = useState<SubjectType | null>(null);
  const queryClient = useQueryClient();
  const [isAddStudentOpen, setIsAddStudentOpen] = useState(false);
  const [isDeleteClassModalOpen, setIsDeleteClassModalOpen] = useState(false);

  const [isStudentPopoverOpen,setIsStudentPopoverOpen]=useState(false)
  
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

  // Query to fetch students
  const studentsQuery = useQuery({
    queryKey: ["students"],
    queryFn: () => getUsers({ params: { is_student: true } }),
    enabled: isAddStudentOpen, // Only fetch when dialog is open
  });

  useEffect(() => {
    if (schoolYearsQuery.data) {
      const data = schoolYearsQuery.data;
      if (!selectedSchoolYearId && data.length > 0) {
        const activeYear = data.find(year => year.is_active);
        if (activeYear) {
          setSelectedSchoolYearId(activeYear.start_year);
        } else if (data.length > 0) {
          setSelectedSchoolYearId(data[0].start_year);
        }
      }
    }
  }, [schoolYearsQuery.data, selectedSchoolYearId]);

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
  const classStudentsQuery = useQuery({
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

  const deleteClassMutation = useMutation({
    mutationFn: deleteClass,
    onSuccess: () => {
      toast.success(t("class.delete.success") || "Class deleted successfully");
      router.push('/admin/classes');
    },
    onError: (error) => {
      toast.error(t("class.delete.error") || "Failed to delete class", {
        description: error instanceof Error ? error.message : "Unknown error occurred",
      });
    },
  });

  // Add student mutation
  const addStudentMutation = useMutation({
    mutationFn: createUserClass,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["class", id, "students", selectedSchoolYearId] });
      toast.success(t("class.detail.studentAdded"));
      setIsAddStudentOpen(false);
      form.reset();
    },
    onError: (error) => {
      toast.error(t("class.detail.studentAddFailed"), {
        description: error instanceof Error ? error.message : "Unknown error occurred",
      });
    },
  });

  // Form definition
  const form = useForm<AddStudentFormValues>({
    resolver: zodResolver(addStudentSchema),
    defaultValues: {
      user_id: "",
    },
  });

  const handleDeleteSubject = (e: React.MouseEvent, subject: SubjectType) => {
    e.preventDefault();
    e.stopPropagation();
    setSubjectToDelete(subject);
  };

  const handleEditSubject = (e: React.MouseEvent, subject: SubjectType) => {
    e.preventDefault();
    e.stopPropagation();
    setSubject(subject);
  };

  const handleConfirmDelete = () => {
    if (subjectToDelete) {
      deleteSubjectMutation.mutate({
        class_pk: id,
        subject_pk: subjectToDelete.id.toString(),
      });
    }
  };
  
  const handleSchoolYearChange = (value: string) => {
    setSelectedSchoolYearId(parseInt(value));
  };

  const handleAddStudentSubmit = (values: AddStudentFormValues) => {
    if (!selectedSchoolYearId) {
      toast.error(t("class.detail.selectSchoolYearFirst"));
      return;
    }

    const schoolYear = schoolYearsQuery.data?.find(year => year.start_year === selectedSchoolYearId);
    if (!schoolYear) {
      toast.error(t("class.detail.invalidSchoolYear"));
      return;
    }

    addStudentMutation.mutate({
      user_id: values.user_id,
      class_level_id: parseInt(id),
      school_year_id: schoolYear.id,
    });
  };

  const getSelectedSchoolYearDisplay = (): string => {
    if (!schoolYearsQuery.data || !selectedSchoolYearId) return currentSchoolYear;
    
    const selectedYear = schoolYearsQuery.data.find(
      year => year.start_year === selectedSchoolYearId
    );
    
    return selectedYear ? selectedYear.formatted_year : currentSchoolYear;
  };

  const handleDeleteClass = () => {
    setIsDeleteClassModalOpen(true);
  };

  const handleConfirmDeleteClass = () => {
    if(id){

      deleteClassMutation.mutate(id);
    }
  };

  const router = useRouter();

  if (isLoading) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="container flex justify-center items-center h-screen"
      >
        <div className="flex flex-col items-center gap-4">
          <Loader className="animate-spin size-10 text-primary" />
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { delay: 0.3 } }}
            className="text-muted-foreground"
          >
            {t("loading")}...
          </motion.p>
        </div>
      </motion.div>
    );
  }

  if (isError) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="container flex justify-center items-center h-screen"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 100 }}
          className="bg-red-100 border border-red-400 text-red-700 px-5 py-4 rounded-lg shadow-md max-w-md w-full"
        >
          <strong className="font-bold">{t("error")}: </strong>
          <span className="block mt-1">{error.message}</span>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="container py-10 flex flex-col gap-6"
      >
        <motion.div
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
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
                <BreadcrumbPage>{data?.definition_display}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </motion.div>

        <motion.div 
          initial={{ y: 20, opacity: 0 }} 
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex flex-col gap-5"
        >
          <div className="flex items-center justify-between">
            <motion.div 
              className="flex items-center gap-2"
              // whileHover={{ scale: 1.01 }}
              // transition={{ type: "spring", stiffness: 400 }}
            >
              <Book className="size-6 text-primary" />
              <div>
                <h1 className="text-2xl font-semibold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                  {data?.definition_display} {data?.variant ? `(${data.variant})` : ''}
                </h1>
                {data?.description && (
                  <p className="text-muted-foreground text-sm">{data.description}</p>
                )}
              </div>
            </motion.div>
            <div className="flex items-center gap-3">
              <motion.div
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
              >
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="outline"
                        className="text-destructive border-destructive/30 hover:bg-destructive/10"
                        onClick={handleDeleteClass}
                      >
                        <Trash2 className="size-4 mr-1" />
                        {t("class.detail.deleteClass") || "Delete Class"}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>{t("class.detail.deleteClassTooltip") || "Delete this class permanently"}</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </motion.div>
              
              <motion.div
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button 
                  onClick={() => data && data.id && onAdd(data.id)}
                  className="bg-primary hover:bg-primary/90 shadow-md hover:shadow-lg transition-all"
                >
                  <Plus className="size-4 mr-2" />
                  {t("class.detail.addButton")}
                </Button>
              </motion.div>
            </div>
          </div>

          <Tabs 
            defaultValue="subjects" 
            className="w-full"
          >
            <TabsList className="mb-4">
              <TabsTrigger value="subjects">{t("class.detail.subjectsTab")}</TabsTrigger>
              <TabsTrigger value="students">
                {t("class.detail.studentsCount")} ({classStudentsQuery.data?.length || 0})
              </TabsTrigger>
            </TabsList>

            <AnimatePresence mode="wait">
              <TabsContent key="subjects-tab" value="subjects">
                {subjectQuery.isLoading ? (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex justify-center py-10"
                  >
                    <Loader className="animate-spin size-8 text-primary" />
                  </motion.div>
                ) : subjectQuery.data && subjectQuery.data.length > 0 ? (
                  <motion.div 
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="grid sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-5"
                  >
                    {subjectQuery.data?.map((subject) => (
                      <motion.div
                        key={subject.id}
                        variants={cardVariants}
                        whileHover="hover"
                        className="cursor-pointer"
                      >
                        <Link 
                          href={`/admin/classes/${id}/subjects/${subject.id}/chapters`} 
                          passHref
                          className="block h-full"
                          onClick={(e) => {
                            if ((e.target as HTMLElement).closest('button')) {
                              e.preventDefault();
                            }
                          }}
                        >
                          <Card className="h-full border border-muted bg-white/50 backdrop-blur-sm hover:bg-white transition-all duration-300">
                            <CardHeader>
                              <CardTitle className="flex items-center gap-2">
                                <Book className="size-5 text-primary" />
                                {subject.name}
                              </CardTitle>
                              {subject.description && (
                                <CardDescription className="line-clamp-2">
                                  {subject.description}
                                </CardDescription>
                              )}
                            </CardHeader>
                            <CardContent>
                            </CardContent>
                            <CardFooter className="justify-between">
                              <TooltipProvider>
                                <div className="flex items-center gap-2">
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        variant="outline"
                                        size="icon"
                                        onClick={(e) => {
                                          e.preventDefault();
                                          e.stopPropagation();
                                          handleEditSubject(e, subject);
                                        }}
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
                                        onClick={(e) => {
                                          e.preventDefault();
                                          e.stopPropagation();
                                          handleDeleteSubject(e, subject);
                                        }}
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
                                  <Button 
                                    variant="default"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      router.push(`/admin/classes/${id}/subjects/${subject.id}/chapters`);
                                    }}
                                  >
                                    <Eye className="size-4 mr-2" />
                                    {t("class.detail.viewChapters")}
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>{t("class.detail.viewChapters")}</TooltipContent>
                              </Tooltip>
                            </CardFooter>
                          </Card>
                        </Link>
                      </motion.div>
                    ))}
                  </motion.div>
                ) : (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-center py-16 bg-muted/10 rounded-md border border-dashed"
                  >
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 0.5 }}
                      transition={{ delay: 0.3, type: "spring" }}
                    >
                      <Book className="size-12 text-muted-foreground mx-auto mb-3" />
                    </motion.div>
                    <h3 className="text-xl font-semibold mb-2">{t("class.detail.noSubjects")}</h3>
                    <p className="text-muted-foreground max-w-md mx-auto mb-6">
                      {t("class.detail.noSubjectsDesc")}
                    </p>
                    <motion.div
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                    >
                      <Button 
                        onClick={() => data && data.id && onAdd(data.id)}
                        className="bg-primary hover:bg-primary/90"
                      >
                        <Plus className="size-4 mr-2" />
                        {t("class.detail.addFirstSubject")}
                      </Button>
                    </motion.div>
                  </motion.div>
                )}

                {subjectQuery.isError && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
                    role="alert"
                  >
                    <strong className="font-bold">{t("error")}: </strong>
                    <span className="block sm:inline">{subjectQuery.error.message}</span>
                  </motion.div>
                )}
              </TabsContent>

              <TabsContent key="students-tab" value="students">
                <motion.div
                  variants={itemVariants}
                  initial="hidden"
                  animate="visible"
                >
                  <Card className="overflow-hidden border bg-white/80 backdrop-blur-sm shadow-md">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                          <Users className="size-5 text-primary" />
                          {t("class.detail.enrolledStudents")}
                        </CardTitle>
                        
                        <div className="flex items-center gap-4">
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
                          
                          <Button 
                            onClick={() => setIsAddStudentOpen(true)}
                            size="sm"
                            className="gap-1"
                            disabled={!selectedSchoolYearId}
                          >
                            <Plus className="h-4 w-4" />
                            Add Student
                          </Button>
                        </div>
                      </div>
                      <CardDescription>
                        {t("class.detail.enrolledStudentsFor", { year: getSelectedSchoolYearDisplay() })}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {classStudentsQuery.isLoading ? (
                        <div className="flex justify-center py-10">
                          <Loader className="animate-spin size-8 text-primary" />
                        </div>
                      ) : classStudentsQuery.data && classStudentsQuery.data.length > 0 ? (
                        <div className="border rounded-md overflow-hidden">
                          <motion.table 
                            className="w-full"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.3 }}
                          >
                            <thead>
                              <tr className="border-b bg-muted/50">
                                <th className="py-2 px-4 text-left font-medium">{t("class.detail.studentInfo")}</th>
                                <th className="py-2 px-4 text-left font-medium">{t("class.detail.studentEmail")}</th>
                                <th className="py-2 px-4 text-left font-medium">{t("class.detail.studentEnrollmentDate")}</th>
                              </tr>
                            </thead>
                            <tbody>
                              {classStudentsQuery.data.map((enrollment, index) => (
                                <motion.tr 
                                  key={enrollment.id} 
                                  className="border-b last:border-0 hover:bg-muted/20 transition-colors"
                                  initial={{ opacity: 0, x: -10 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: index * 0.05 }}
                                >
                                  <td className="py-3 px-4">
                                    <Link 
                                      href={`/admin/users/${enrollment.user.id}`}
                                      className="flex items-center gap-2"
                                      >
                                        <div className="flex items-center gap-2">
                                      <Avatar className="size-8 border-2 border-primary/20">
                                        <AvatarImage src={enrollment.user.profile_picture || ''} />
                                        <AvatarFallback className="bg-primary/10 text-primary font-medium">
                                          {enrollment.user.first_name?.[0] || ''}{enrollment.user.last_name?.[0] || ''}
                                        </AvatarFallback>
                                      </Avatar>
                                      <div>
                                        <p className="font-medium">{enrollment.user.first_name} {enrollment.user.last_name}</p>
                                        <p className="text-xs text-muted-foreground">{enrollment.user.phone_number}</p>
                                      </div>
                                    </div>
                                      </Link>
                                  </td>
                                  <td className="py-3 px-4 text-sm">{enrollment.user.email}</td>
                                  <td className="py-3 px-4 text-sm">
                                    {new Date(enrollment.created_at).toLocaleDateString()}
                                  </td>
                                </motion.tr>
                              ))}
                            </tbody>
                          </motion.table>
                        </div>
                      ) : (
                        <motion.div 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.2 }}
                          className="text-center py-12 bg-muted/10 rounded-md"
                        >
                          <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 0.5 }}
                            transition={{ delay: 0.3, type: "spring" }}
                          >
                            <Users className="size-12 text-muted-foreground mx-auto mb-2" />
                          </motion.div>
                          <h3 className="text-xl font-semibold mb-2">{t("class.detail.noStudents")}</h3>
                          <p className="text-muted-foreground max-w-md mx-auto mb-6">
                            {t("class.detail.noStudentsDesc", { year: getSelectedSchoolYearDisplay() })}
                          </p>
                          <Button 
                            onClick={() => setIsAddStudentOpen(true)}
                            disabled={!selectedSchoolYearId}
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Add First Student
                          </Button>
                        </motion.div>
                      )}
                      
                      {classStudentsQuery.isError && (
                        <motion.div 
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mt-4"
                        >
                          <strong className="font-bold">{t("error")}: </strong>
                          <span className="block sm:inline">{classStudentsQuery.error.message}</span>
                        </motion.div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              </TabsContent>
            </AnimatePresence>
          </Tabs>
        </motion.div>
      </motion.div>

      <Credenza open={isAddStudentOpen} onOpenChange={setIsAddStudentOpen}>
        <CredenzaContent className="sm:max-w-xl">
          <CredenzaHeader>
            <CredenzaTitle>{t("class.detail.addStudent")}</CredenzaTitle>
            <CredenzaDescription>
              {t("class.detail.addStudentDesc", { name: data?.name, year: getSelectedSchoolYearDisplay() })}
            </CredenzaDescription>
          </CredenzaHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleAddStudentSubmit)} className="space-y-4 py-4">
              <FormField
                control={form.control}
                name="user_id"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>{t("class.detail.studentLabel")}</FormLabel>
                    <Popover open={isStudentPopoverOpen} onOpenChange={setIsStudentPopoverOpen}>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            role="combobox"
                            className={cn(
                              "w-full justify-between",
                              !field.value && "text-muted-foreground"
                            )}
                            disabled={studentsQuery.isLoading}
                          >
                            {field.value ? (
                              studentsQuery.data?.find((student) => student.id === field.value)
                                ? `${studentsQuery.data?.find((student) => student.id === field.value)?.first_name} ${
                                    studentsQuery.data?.find((student) => student.id === field.value)?.last_name
                                  }`
                                : t("class.detail.selectStudent")
                            ) : (
                              t("class.detail.selectStudent")
                            )}
                            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent 
                        align="start" 
                        side="bottom" 
                        className="p-0 w-[var(--radix-popover-trigger-width)] min-w-[240px]"
                        style={{ width: "var(--radix-popover-trigger-width)" }}
                      >
                        <Command className="w-full" style={{ width: "100%" }}>
                          <CommandInput placeholder={t("class.detail.searchStudents")} className="h-9" />
                          <CommandList>
                            <CommandEmpty>
                              {studentsQuery.isLoading ? (
                                <div className="flex items-center justify-center py-6">
                                  <Loader className="size-6 animate-spin" />
                                </div>
                              ) : (
                                t("class.detail.noStudentsFound")
                              )}
                            </CommandEmpty>
                            <CommandGroup>
                              {studentsQuery.data?.map((student) => (
                                <CommandItem
                                  key={student.id}
                                  value={`${student.first_name} ${student.last_name} ${student.email}`}
                                  onSelect={() => {
                                    form.setValue("user_id", student.id);
                                    setIsStudentPopoverOpen(false);
                                  }}
                                >
                                  <div className="flex items-center">
                                    <Avatar className="h-6 w-6 mr-2">
                                      <AvatarImage src={student.profile_picture || ""} />
                                      <AvatarFallback className="text-xs">
                                        {student.first_name[0]}{student.last_name[0]}
                                      </AvatarFallback>
                                    </Avatar>
                                    <span>{student.first_name} {student.last_name}</span>
                                  </div>
                                  <CheckIcon
                                    className={cn(
                                      "ml-auto h-4 w-4",
                                      field.value === student.id ? "opacity-100" : "opacity-0"
                                    )}
                                  />
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <CredenzaFooter>
                <CredenzaClose asChild>
                  <Button type="button" variant="outline">{t("common.cancel")}</Button>
                </CredenzaClose>
                <Button 
                  type="submit" 
                  disabled={addStudentMutation.isPending || !form.formState.isValid}
                >
                  {addStudentMutation.isPending && <Loader className="mr-2 h-4 w-4 animate-spin" />}
                  {t("class.detail.addStudentButton")}
                </Button>
              </CredenzaFooter>
            </form>
          </Form>
        </CredenzaContent>
      </Credenza>

      <DeleteConfirmationModal
        isOpen={isDeleteClassModalOpen}
        onClose={() => setIsDeleteClassModalOpen(false)}
        onConfirm={handleConfirmDeleteClass}
        title={t("class.delete.title") || "Delete Class"}
        description={t("class.delete.description") || "Are you sure you want to delete this class? This action cannot be undone and will remove all associated subjects, chapters, and resources."}
        isLoading={deleteClassMutation.isPending}
      />

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