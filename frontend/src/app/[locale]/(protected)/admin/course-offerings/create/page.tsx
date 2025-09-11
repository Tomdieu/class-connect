"use client";

import { createCourseOffering } from "@/actions/course-offerings";
import { Button } from "@/components/ui/button";
import { CalendarIcon, Check } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useI18n } from "@/locales/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Loader2, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { AxiosError } from "axios";
import { useEffect, useState } from "react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
// Updated imports for new class structure and required functions
import { listSubjects, getformatedClasses, listClasses } from "@/actions/courses";
import { getStudentsByClassId } from "@/actions/user-classes";
import { listSchoolYear } from "@/actions/enrollments";
import { getAvailabilityOfUser, updateAvailabilityTimeSlot } from "@/actions/user-availability";
import {
  ClassType,
  CourseOfferingCreateType,
  ClassDetail,
  ClassStructure,
  UserClassType,
  SchoolYearType,
  UserAvailabilityType,
  DayOfWeek,
  TimeSlot
} from "@/types";

import { 
  formatClassName 
} from "@/lib/utils";

import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { getUsers } from "@/actions/accounts";

export default function CreateCourseOfferPage() {
  const t = useI18n();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [selectedClass, setSelectedClass] = useState<ClassDetail | null>(null);
  const [open, setOpen] = useState<boolean>(false);
  const [subjectOpen, setSubjectOpen] = useState<boolean>(false);
  const [studentOpen, setStudentOpen] = useState<boolean>(false);
  const [dateOpen, setDateOpen] = useState<boolean>(false);
  const [showAvailability, setShowAvailability] = useState<boolean>(false);

  // Create the form schema
  const formSchema = z.object({
    student_id: z.string({
      required_error: "Please select a student",
    }),
    subject_id: z.number({
      required_error: "Please select a subject",
    }),
    class_level_id: z.number({
      required_error: "Please select a class level",
    }),
    duration: z.coerce.number({
      required_error: "Duration is required",
      invalid_type_error: "Duration must be a number",
    }).min(1, "Duration must be at least 1 hour"),
    frequency: z.coerce.number({
      required_error: "Frequency is required",
      invalid_type_error: "Frequency must be a number",
    }).nonnegative("Frequency cannot be negative")
      .min(1, "Frequency must be at least 1 time per week")
      .max(7, "Frequency cannot be more than 7 times per week"),
    start_date: z.date({
      required_error: "Start date is required",
    }),
    hourly_rate: z.coerce.number({
      required_error: "Hourly rate is required",
      invalid_type_error: "Hourly rate must be a number",
    }).nonnegative("Hourly rate cannot be negative")
      .min(1000, "Hourly rate must be at least 1000 XAF"),
  });

  // Create form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      duration: 1,
      frequency: 1,
      hourly_rate: 5000,
    },
  });

  // Query for fetching classes - updated to use listClasses instead of getClasses
  const { data: classes, isLoading: classesLoading,error,isError } = useQuery({
    queryKey: ["classes"],
    queryFn: () => listClasses({params: {}}), // Using listClasses instead of getClasses
  });

  // Query for fetching formatted classes structure
  const { data: formattedClasses, isLoading: formattedClassesLoading } = useQuery<ClassStructure>({
    queryKey: ["formatted-classes"],
    queryFn: () => getformatedClasses(),
  });

  useEffect(()=>{
    if(isError){
      toast.error( error.message ||"Error fetching classes");
    }
  },[error?.message, isError]);

  // Query for fetching students
  const { data: students, isLoading: studentsLoading } = useQuery({
    queryKey: ["students"],
    queryFn: () => getUsers({ params: { is_student: true} }),
  });

  // Query for fetching subjects based on selected class
  const { data: subjects, isLoading: subjectsLoading } = useQuery({
    queryKey: ["subjects", form.watch("class_level_id")],
    queryFn: () => listSubjects({ 
      class_pk: form.watch("class_level_id").toString(), 
      params: {} 
    }),
    enabled: !!form.watch("class_level_id"),
  });

  // Query for fetching active school year
  const { data: schoolYears, isLoading: schoolYearsLoading } = useQuery({
    queryKey: ["school-years"],
    queryFn: listSchoolYear,
  });

  // Get the active school year
  const activeSchoolYear = schoolYears?.find(year => year.is_active);

  // Query for fetching students based on selected class and active school year
  const { data: classStudents, isLoading: classStudentsLoading } = useQuery({
    queryKey: ["class-students", form.watch("class_level_id"), form.watch("subject_id"), activeSchoolYear?.formatted_year],
    queryFn: () => getStudentsByClassId({ 
      class_level: form.watch("class_level_id"), 
      school_year: activeSchoolYear?.formatted_year,
      subject: form.watch("subject_id"),
      no_assign_teacher: true
    }),
    enabled: !!form.watch("class_level_id") && !!activeSchoolYear,
  });

  // Query for fetching student availability
  const { data: studentAvailability, isLoading: availabilityLoading } = useQuery({
    queryKey: ["student-availability", selectedStudentId],
    queryFn: () => getAvailabilityOfUser({ params: { user_id: selectedStudentId! } }),
    enabled: !!selectedStudentId && showAvailability,
  });

  // Mutation to update student availability
  const updateAvailabilityMutation = useMutation({
    mutationFn: async ({ 
      id, 
      slot_id, 
      is_available 
    }: { 
      id: number, 
      slot_id: number, 
      is_available: boolean 
    }) => {
      return await updateAvailabilityTimeSlot({
        id,
        data: { slot_id, is_available }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["student-availability", selectedStudentId] });
      toast.success(t("availability.slotUpdated"));
    },
    onError: (err) => {
      toast.error(typeof err === 'string' ? err : t('availability.errors.updateSlotFailed'));
    }
  });

  // Effect to update form when class is selected
  useEffect(() => {
    if (selectedClass) {
      form.setValue("class_level_id", selectedClass.id!);
    }
  }, [selectedClass, form]);

  // Create course offering mutation
  const mutation = useMutation({
    mutationFn: (values: CourseOfferingCreateType) => createCourseOffering(values),
    onSuccess: () => {
      toast.success("Course offering created successfully");
      router.push("/admin/course-offerings");
    },
    onError: (error: Error | AxiosError) => {
      console.error("Error creating course offering:", error);
      let errorMessage = "Failed to create course offering";
      
      if (error instanceof Error) {
        try {
          const parsedError = JSON.parse(error.message);
          if (typeof parsedError === 'object') {
            // Handle structured API error responses
            const firstErrorKey = Object.keys(parsedError)[0];
            const firstError = parsedError[firstErrorKey];
            if (Array.isArray(firstError) && firstError.length > 0) {
              errorMessage = `${firstErrorKey}: ${firstError[0]}`;
            } else if (typeof firstError === 'string') {
              errorMessage = firstError;
            }
          }
        } catch (e) {
          errorMessage = (e as Error).message;
        }
      }
      
      toast.error(errorMessage);
    },
  });

  // Form submission handler
  const onSubmit = (values: z.infer<typeof formSchema>) => {
    const formattedDate = format(values.start_date, "yyyy-MM-dd");
    
    const offeringData: CourseOfferingCreateType = {
      ...values,
      start_date: formattedDate,
    };
    
    mutation.mutate(offeringData);
  };

  // Modify the class selection UI to use the new grouping and formatting functions
  return (
    <div className="container py-6 space-y-6">
      {/* Header with back button */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <Button
          variant="ghost"
          className="p-0 h-auto flex items-center text-muted-foreground"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          {t("courseOfferings.create.back")}
        </Button>
      </div>

      <h1 className="text-3xl font-bold tracking-tight">{t("courseOfferings.create.title")}</h1>
      <p className="text-muted-foreground">{t("courseOfferings.create.description")}</p>

      <Card>
        <CardHeader>
          <CardTitle>{t("courseOfferings.create.offeringDetails")}</CardTitle>
          <CardDescription>
            {t("courseOfferings.create.offeringDetailsDescription")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Class Level Selection - Updated to use getformatedClasses */}
                <FormField
                  control={form.control}
                  name="class_level_id"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>{t("courseOfferings.create.classLevel")}</FormLabel>
                      <Popover open={open} onOpenChange={setOpen}>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              role="combobox"
                              className={cn(
                                "w-full justify-between",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {selectedClass
                                ? `${selectedClass.definition_display}${selectedClass.variant ? ` (${selectedClass.variant})` : ''}`
                                : t("courseOfferings.create.selectClass")}
                              <ArrowLeft className="ml-2 h-4 w-4 shrink-0 opacity-50 rotate-90" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-full p-0 max-h-[400px] overflow-y-auto" align="start">
                          <Command>
                            <CommandInput
                              placeholder={t("courseOfferings.create.searchClass")}
                              className="h-9"
                            />
                            <CommandList>
                              <CommandEmpty>{t("courseOfferings.create.noClassFound")}</CommandEmpty>
                              {formattedClassesLoading ? (
                                <div className="p-4 text-center">
                                  <Loader2 className="h-5 w-5 animate-spin mx-auto" />
                                  <p className="text-sm text-muted-foreground mt-2">{t("loading")}</p>
                                </div>
                              ) : formattedClasses ? (
                                Object.entries(formattedClasses).map(([languageCode, sectionDetail]) => (
                                  <div key={languageCode}>
                                    <CommandGroup className="font-semibold text-md py-2">
                                      <div className="flex items-center gap-2 px-2 mb-1">
                                        <Badge variant="outline" className="bg-primary/5 text-primary">
                                          {sectionDetail.label}
                                        </Badge>
                                      </div>
                                      
                                      {Object.entries(sectionDetail.levels).map(([levelKey, levelDetail]) => {
                                        const levelLabel = levelDetail.label;
                                        
                                        return (
                                          <div key={levelKey} className="mb-1">
                                            <p className="px-2 text-sm font-medium text-muted-foreground mb-1">
                                              {levelLabel}
                                            </p>
                                            
                                            {Object.entries(levelDetail.groups).map(([groupKey, classes]) => {
                                              if (groupKey === 'classes') {
                                                // Direct classes without further grouping
                                                return classes && (classes as ClassDetail[]).map((classItem) => (
                                                  <CommandItem
                                                    key={classItem.id}
                                                    value={`${classItem.definition_display}${classItem.variant ? ` ${classItem.variant}` : ''}`}
                                                    onSelect={() => {
                                                      setSelectedClass(classItem);
                                                      form.setValue("class_level_id", classItem.id);
                                                      setOpen(false);
                                                    }}
                                                    className="pl-4"
                                                  >
                                                    <span className="flex-1">{classItem.definition_display}{classItem.variant ? ` (${classItem.variant})` : ''}</span>
                                                    {field.value === classItem.id && <Check className="h-4 w-4 text-primary ml-2" />}
                                                  </CommandItem>
                                                ));
                                              } else {
                                                // Classes with further grouping (e.g., LYCEE specialities)
                                                return (
                                                  <div key={groupKey} className="mb-1">
                                                    <p className="px-4 text-xs font-medium text-muted-foreground/80">
                                                      {groupKey}
                                                    </p>
                                                    {(classes as ClassDetail[]).map((classItem) => (
                                                      <CommandItem
                                                        key={classItem.id}
                                                        value={`${classItem.definition_display}${classItem.variant ? ` ${classItem.variant}` : ''}`}
                                                        onSelect={() => {
                                                          setSelectedClass(classItem);
                                                          form.setValue("class_level_id", classItem.id);
                                                          setOpen(false);
                                                        }}
                                                        className="pl-6"
                                                      >
                                                        <span className="flex-1">{classItem.definition_display}{classItem.variant ? ` (${classItem.variant})` : ''}</span>
                                                        {field.value === classItem.id && <Check className="h-4 w-4 text-primary ml-2" />}
                                                      </CommandItem>
                                                    ))}
                                                  </div>
                                                );
                                              }
                                            })}
                                            
                                            {levelKey !== Object.keys(sectionDetail.levels).slice(-1)[0] && (
                                              <CommandSeparator />
                                            )}
                                          </div>
                                        );
                                      })}
                                    </CommandGroup>
                                    
                                    {languageCode !== Object.keys(formattedClasses).slice(-1)[0] && (
                                      <CommandSeparator />
                                    )}
                                  </div>
                                ))
                              ) : (
                                <div className="p-4 text-center">
                                  <p className="text-sm text-muted-foreground">{t("class.noClassesFound")}</p>
                                </div>
                              )}
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                      <FormDescription>
                        {t("courseOfferings.create.classLevelDescription")}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* School Year - Non-editable field showing active school year */}
                <div className="col-span-1 md:col-span-2">
                  <div className="bg-muted/40 rounded-lg p-4 border border-border">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-medium mb-1">{t("courseOfferings.create.schoolYear")}</h3>
                        <p className="text-sm text-muted-foreground">
                          {schoolYearsLoading ? (
                            <Loader2 className="h-4 w-4 animate-spin inline mr-2" />
                          ) : activeSchoolYear ? (
                            <span className="font-medium">{activeSchoolYear.formatted_year}</span>
                          ) : (
                            t("courseOfferings.create.noActiveSchoolYear")
                          )}
                        </p>
                      </div>
                      {activeSchoolYear && (
                        <Badge variant="outline" className="bg-primary/10 text-primary">
                          {t("courseOfferings.create.active")}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                {/* Subject Selection - Updated to close popover when selecting */}
                <FormField
                  control={form.control}
                  name="subject_id"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>{t("courseOfferings.create.subject")}</FormLabel>
                      <Popover open={subjectOpen} onOpenChange={setSubjectOpen}>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              role="combobox"
                              className={cn(
                                "w-full justify-between",
                                !field.value && "text-muted-foreground"
                              )}
                              disabled={!selectedClass}
                            >
                              {field.value && subjects
                                ? subjects.find(
                                    (subject) => subject.id === field.value
                                  )?.name
                                : t("courseOfferings.create.selectSubject")}
                              <ArrowLeft className="ml-2 h-4 w-4 shrink-0 opacity-50 rotate-90" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-full p-0" align="start">
                          <Command>
                            <CommandInput
                              placeholder={t("courseOfferings.create.searchSubject")}
                              className="h-9"
                            />
                            <CommandList>
                              <CommandEmpty>{t("courseOfferings.create.noSubjectFound")}</CommandEmpty>
                              <CommandGroup>
                                {!subjectsLoading &&
                                  subjects?.map((subject) => (
                                    <CommandItem
                                      key={subject.id}
                                      value={subject.name}
                                      onSelect={() => {
                                        form.setValue("subject_id", subject.id);
                                        setSubjectOpen(false); // Close the popover when a subject is selected
                                      }}
                                    >
                                      {subject.name}
                                    </CommandItem>
                                  ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                      <FormDescription>
                        {t("courseOfferings.create.subjectDescription")}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Student Selection - Updated to use class students from getStudentsByClassId */}
                <FormField
                  control={form.control}
                  name="student_id"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>{t("courseOfferings.create.student")}</FormLabel>
                      <Popover open={studentOpen} onOpenChange={setStudentOpen}>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              role="combobox"
                              className={cn(
                                "w-full justify-between",
                                !field.value && "text-muted-foreground"
                              )}
                              disabled={!selectedClass || !activeSchoolYear}
                            >
                              {field.value && classStudents
                                ? classStudents.find(
                                    (student) => student.user.id === field.value
                                  )?.user.email || t("courseOfferings.create.studentNotFound")
                                : t("courseOfferings.create.selectStudent")}
                              <ArrowLeft className="ml-2 h-4 w-4 shrink-0 opacity-50 rotate-90" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-full p-0" align="start">
                          <Command>
                            <CommandInput
                              placeholder={t("courseOfferings.create.searchStudent")}
                              className="h-9"
                            />
                            <CommandList>
                              <CommandEmpty>{t("courseOfferings.create.noStudentFound")}</CommandEmpty>
                              {classStudentsLoading ? (
                                <div className="p-4 text-center">
                                  <Loader2 className="h-5 w-5 animate-spin mx-auto" />
                                  <p className="text-sm text-muted-foreground mt-2">{t("loading")}</p>
                                </div>
                              ) : (
                                <CommandGroup>
                                  {classStudents?.map((userClass) => (
                                    <CommandItem
                                      key={userClass.user.id}
                                      value={`${userClass.user.first_name} ${userClass.user.last_name} ${userClass.user.email}`}
                                      onSelect={() => {
                                        form.setValue("student_id", userClass.user.id);
                                        setSelectedStudentId(userClass.user.id);
                                        setStudentOpen(false);
                                      }}
                                    >
                                      {userClass.user.first_name} {userClass.user.last_name} ({userClass.user.email})
                                    </CommandItem>
                                  ))}
                                </CommandGroup>
                              )}
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                      <FormDescription>
                        {t("courseOfferings.create.studentDescription")}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Start Date */}
                <FormField
                  control={form.control}
                  name="start_date"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>{t("courseOfferings.create.startDate")}</FormLabel>
                      <Popover open={dateOpen} onOpenChange={setDateOpen}>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>{t("courseOfferings.create.pickDate")}</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={(date) => {
                              field.onChange(date);
                              setDateOpen(false); // Close popover after selecting a date
                            }}
                            disabled={(date) =>
                              date < new Date(new Date().setHours(0, 0, 0, 0))
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormDescription>
                        {t("courseOfferings.create.startDateDescription")}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Duration - Updated to use Slider with 0.5 step */}
                <FormField
                  control={form.control}
                  name="duration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("courseOfferings.create.duration")}</FormLabel>
                      <FormControl>
                        <div className="space-y-3">
                          <Slider
                            min={1}
                            max={5}
                            step={0.5}
                            value={[field.value]}
                            onValueChange={(values) => field.onChange(values[0])}
                            className="w-full"
                          />
                          <div className="flex justify-between text-xs text-muted-foreground px-1">
                            <span>1h</span>
                            <span>2h</span>
                            <span>3h</span>
                            <span>4h</span>
                            <span>5h</span>
                          </div>
                          <div className="text-center font-medium">
                            {field.value === Math.floor(field.value)
                              ? `${field.value} ${field.value === 1 ? t("courseOfferings.create.hour") : t("courseOfferings.create.hours")}`
                              : `${Math.floor(field.value)}h ${Math.round((field.value % 1) * 60)}min`}
                          </div>
                        </div>
                      </FormControl>
                      <FormDescription>
                        {t("courseOfferings.create.durationDescription")}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Frequency */}
                <FormField
                  control={form.control}
                  name="frequency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("courseOfferings.create.frequency")}</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="1"
                          max="7"
                          placeholder={t("courseOfferings.create.frequency")}
                          onKeyDown={(e) => {
                            // Prevent negative values by blocking the minus key
                            if (e.key === '-' || 
                                !/^[0-9]$/.test(e.key) && 
                                !['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab'].includes(e.key)) {
                              e.preventDefault();
                            }
                          }}
                          onChange={(e) => {
                            const value = e.target.value.replace(/[^0-9]/g, '');
                            field.onChange(value ? parseInt(value, 10) : '');
                          }}
                          value={field.value}
                        />
                      </FormControl>
                      <FormDescription>
                        {t("courseOfferings.create.frequencyDescription")}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Hourly Rate */}
                <FormField
                  control={form.control}
                  name="hourly_rate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("courseOfferings.create.hourlyRate")}</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="1000"
                          placeholder={t("courseOfferings.create.hourlyRate")}
                          onKeyDown={(e) => {
                            // Prevent negative values by blocking the minus key and non-numeric keys
                            if (e.key === '-' || 
                                !/^[0-9]$/.test(e.key) && 
                                !['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab'].includes(e.key)) {
                              e.preventDefault();
                            }
                          }}
                          onChange={(e) => {
                            const value = e.target.value.replace(/[^0-9]/g, '');
                            field.onChange(value ? parseInt(value, 10) : '');
                          }}
                          value={field.value}
                        />
                      </FormControl>
                      <FormDescription>
                        {t("courseOfferings.create.hourlyRateDescription")}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Student Availability Section */}
                {selectedStudentId && (
                  <div className="col-span-1 md:col-span-2 mt-4">
                    <Accordion type="single" collapsible>
                      <AccordionItem value="availability">
                        <AccordionTrigger 
                          onClick={() => setShowAvailability(!showAvailability)}
                          className="text-primary font-medium"
                        >
                          {t("courseOfferings.create.studentAvailability")}
                        </AccordionTrigger>
                        <AccordionContent>
                          {availabilityLoading ? (
                            <div className="flex justify-center py-6">
                              <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            </div>
                          ) : studentAvailability ? (
                            <div className="space-y-4 py-2">
                              <div className="flex items-center justify-between mb-4 bg-primary/5 p-3 rounded-lg">
                                <div className="flex items-center gap-2">
                                  <div className={`h-3 w-3 rounded-full ${studentAvailability.is_available ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                  <span className="font-medium">
                                    {studentAvailability.is_available 
                                      ? t("availability.statusAvailable") 
                                      : t("availability.statusUnavailable")}
                                  </span>
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  {t("availability.lastUpdated", { 
                                    date: new Date(studentAvailability.last_updated).toLocaleDateString() 
                                  })}
                                </div>
                              </div>

                              {studentAvailability.is_available ? (
                                <div className="overflow-x-auto shadow-md rounded-lg border border-primary/20">
                                  <table className="min-w-full border-collapse bg-card/95 backdrop-blur">
                                    <thead className="bg-primary/10">
                                      <tr>
                                        <th className="border border-primary/20 p-2 w-24 md:w-32 sticky left-0 bg-primary/10 z-10">
                                          {t("availability.timeSlot")}
                                        </th>
                                        {['lun', 'mar', 'mer', 'jeu', 'ven', 'sam', 'dim'].map(day => (
                                          <th key={day} className="border border-primary/20 p-2 text-center">
                                            <span className="hidden md:inline">{`${day}.`}</span>
                                            <span className="md:hidden">{day}</span>
                                          </th>
                                        ))}
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {['matin', '13h-14h', '14h-15h', '15h-16h', '16h-17h', '17h-18h', '18h-19h', '19h-20h'].map((timeSlot, index) => (
                                        <tr key={timeSlot} className={`hover:bg-primary/5 ${index % 2 === 0 ? 'bg-white/50' : 'bg-white/80'}`}>
                                          <td className="border border-primary/20 p-2 font-medium text-center sticky left-0 bg-white/80 z-10">
                                            {timeSlot}
                                          </td>
                                          {(['lun', 'mar', 'mer', 'jeu', 'ven', 'sam', 'dim'] as DayOfWeek[]).map(day => {
                                            const slot = studentAvailability.daily_slots.find(
                                              slot => slot.day === day && slot.time_slot === timeSlot as TimeSlot
                                            );
                                            
                                            return (
                                              <td key={day} className="border border-primary/20 p-2 text-center">
                                                <input
                                                  type="checkbox"
                                                  checked={slot?.is_available || false}
                                                  onChange={() => {
                                                    if (slot) {
                                                      updateAvailabilityMutation.mutate({
                                                        id: studentAvailability.id,
                                                        slot_id: slot.id,
                                                        is_available: !slot.is_available
                                                      });
                                                    }
                                                  }}
                                                  className="h-5 w-5 rounded border-gray-300 text-primary focus:ring-primary/20 cursor-pointer"
                                                />
                                              </td>
                                            );
                                          })}
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              ) : (
                                <div className="bg-card/95 backdrop-blur p-6 text-center rounded-lg border border-primary/20 shadow-md">
                                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-2 text-muted-foreground">
                                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                                    <line x1="16" y1="2" x2="16" y2="6"></line>
                                    <line x1="8" y1="2" x2="8" y2="6"></line>
                                    <line x1="3" y1="10" x2="21" y2="10"></line>
                                  </svg>
                                  <p className="text-muted-foreground">
                                    {t("availability.studentNotAvailable")}
                                  </p>
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="py-4 text-center text-muted-foreground">
                              {t("availability.noDataAvailable")}
                            </div>
                          )}
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  </div>
                )}
              </div>

              <CardFooter className="flex justify-between px-0">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                >
                  {t("courseOfferings.create.cancel")}
                </Button>
                <Button
                  type="submit"
                  disabled={mutation.isPending}
                >
                  {mutation.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {t("courseOfferings.create.submit")}
                </Button>
              </CardFooter>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
