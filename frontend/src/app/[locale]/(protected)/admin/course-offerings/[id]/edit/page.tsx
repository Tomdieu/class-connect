"use client";

import {
  getCourseOffering,
  updateCourseOffering,
} from "@/actions/course-offerings";
import { Button } from "@/components/ui/button";
import { CalendarIcon } from "lucide-react";
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
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { useMutation, useQuery } from "@tanstack/react-query";
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
} from "@/components/ui/command";
import { listClasses, listSubjects } from "@/actions/courses";
import { getUsers } from "@/actions/accounts";
import { ClassType, CourseOfferingCreateType } from "@/types";

import { formatClassName, groupClassesByHierarchy } from "@/lib/utils";

import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";

export default function EditCourseOfferingPage() {
  const t = useI18n();
  const router = useRouter();
  const params = useParams();
  const id = Number(params.id);

  const [selectedClass, setSelectedClass] = useState<ClassType | null>(null);
  const [open, setOpen] = useState<boolean>(false);
  const [subjectOpen, setSubjectOpen] = useState<boolean>(false);
  const [studentOpen, setStudentOpen] = useState<boolean>(false);
  const [dateOpen, setDateOpen] = useState<boolean>(false); // New state for date popover

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
    duration: z.coerce
      .number({
        required_error: "Duration is required",
        invalid_type_error: "Duration must be a number",
      })
      .min(1, "Duration must be at least 1 hour"),
    frequency: z.coerce
      .number({
        required_error: "Frequency is required",
        invalid_type_error: "Frequency must be a number",
      })
      .nonnegative("Frequency cannot be negative")
      .min(1, "Frequency must be at least 1 time per week")
      .max(7, "Frequency cannot be more than 7 times per week"),
    start_date: z.date({
      required_error: "Start date is required",
    }),
    hourly_rate: z.coerce
      .number({
        required_error: "Hourly rate is required",
        invalid_type_error: "Hourly rate must be a number",
      })
      .nonnegative("Hourly rate cannot be negative")
      .min(1000, "Hourly rate must be at least 1000 XAF"),
    is_available: z.boolean().default(true),
  });

  // Create form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      duration: 1,
      frequency: 1,
      hourly_rate: 5000,
      is_available: true,
    },
  });

  // Fetch the course offering data
  const { data: offering, isLoading: offeringLoading } = useQuery({
    queryKey: ["courseOffering", id],
    queryFn: () => getCourseOffering(id),
    enabled: !isNaN(id),
  });

  useEffect(() => {
    if (offering) {
      form.setValue("student_id", offering.student.id);
      form.setValue("subject_id", offering.subject.id);
      form.setValue("class_level_id", offering.class_level.id);
      form.setValue("duration", offering.duration);
      form.setValue("frequency", offering.frequency);
      form.setValue("hourly_rate", offering.hourly_rate);
      form.setValue("is_available", offering.is_available);

      // Parse the date string into a Date object
      if (offering.start_date) {
        const startDate = new Date(offering.start_date);
        form.setValue("start_date", startDate);
      }

      // Set the selected class for the dropdown
      setSelectedClass(offering.class_level);
    }
  }, [form, offering]);

  // Query for fetching classes
  const {
    data: classes,
    isLoading: classesLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["classes"],
    queryFn: () => listClasses({ params: {} }),
  });

  useEffect(() => {
    if (isError) {
      toast.error(error.message || "Error fetching classes");
    }
  }, [error?.message, isError]);

  // Query for fetching students
  const { data: students, isLoading: studentsLoading } = useQuery({
    queryKey: ["students"],
    queryFn: () => getUsers({ params: { is_student: true } }),
  });

  // Query for fetching subjects based on selected class
  const { data: subjects, isLoading: subjectsLoading } = useQuery({
    queryKey: ["subjects", form.watch("class_level_id")],
    queryFn: () =>
      listSubjects({
        class_pk: form.watch("class_level_id").toString(),
        params: {},
      }),
    enabled: !!form.watch("class_level_id"),
  });

  // Effect to update form when class is selected
  useEffect(() => {
    if (selectedClass) {
      form.setValue("class_level_id", selectedClass.id);
    }
  }, [selectedClass, form]);

  // Update course offering mutation
  const mutation = useMutation({
    mutationFn: (values: Partial<CourseOfferingCreateType>) =>
      updateCourseOffering(id, values),
    onSuccess: () => {
      toast.success(t("courseOfferings.edit.success"));
      router.push("/admin/course-offerings");
    },
    onError: (error: Error | AxiosError) => {
      console.error("Error updating course offering:", error);
      let errorMessage = t("courseOfferings.edit.error");

      if (error instanceof Error) {
        try {
          const parsedError = JSON.parse(error.message);
          if (typeof parsedError === "object") {
            // Handle structured API error responses
            const firstErrorKey = Object.keys(parsedError)[0];
            const firstError = parsedError[firstErrorKey];
            if (Array.isArray(firstError) && firstError.length > 0) {
              errorMessage = `${firstErrorKey}: ${firstError[0]}`;
            } else if (typeof firstError === "string") {
              errorMessage = firstError;
            }
          }
        } catch (error) {
          errorMessage = (error as Error).message;
        }
      }

      toast.error(errorMessage);
    },
  });

  // Form submission handler
  const onSubmit = (values: z.infer<typeof formSchema>) => {
    const formattedDate = format(values.start_date, "yyyy-MM-dd");

    const offeringData: Partial<CourseOfferingCreateType> = {
      ...values,
      start_date: formattedDate,
    };

    mutation.mutate(offeringData);
  };

  if (offeringLoading) {
    return (
      <div className="container flex justify-center items-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!offering && !offeringLoading) {
    return (
      <div className="container py-6">
        <div className="text-center py-10">
          <h2 className="text-xl font-semibold">
            {t("courseOfferings.edit.notFound")}
          </h2>
          <Button
            className="mt-4"
            onClick={() => router.push("/admin/course-offerings")}
          >
            {t("courseOfferings.create.back")}
          </Button>
        </div>
      </div>
    );
  }

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
          {t("courseOfferings.edit.back")}
        </Button>
      </div>

      <h1 className="text-3xl font-bold tracking-tight">
        {t("courseOfferings.edit.title")}
      </h1>
      <p className="text-muted-foreground">
        {t("courseOfferings.edit.description")}
      </p>

      <Card>
        <CardHeader>
          <CardTitle>{t("courseOfferings.edit.offeringDetails")}</CardTitle>
          <CardDescription>
            {t("courseOfferings.edit.offeringDetailsDescription")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Class Level Selection */}
                <FormField
                  control={form.control}
                  name="class_level_id"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>
                        {t("courseOfferings.create.classLevel")}
                      </FormLabel>
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
                                ? formatClassName(selectedClass)
                                : t("courseOfferings.create.selectClass")}
                              <ArrowLeft className="ml-2 h-4 w-4 shrink-0 opacity-50 rotate-90" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-full p-0" align="start">
                          <Command>
                            <CommandInput
                              placeholder={t(
                                "courseOfferings.create.searchClass"
                              )}
                              className="h-9"
                            />
                            <CommandList>
                              <CommandEmpty>
                                {t("courseOfferings.create.noClassFound")}
                              </CommandEmpty>
                              {!classesLoading &&
                                classes &&
                                Object.entries(
                                  groupClassesByHierarchy(classes)
                                ).map(([sectionKey, sectionData]) => (
                                  <div key={sectionKey}>
                                    <CommandGroup heading={sectionData.section}>
                                      {Object.entries(sectionData.levels).map(
                                        ([levelKey, levelData]) => (
                                          <div key={levelKey}>
                                            <CommandGroup
                                              heading={levelData.level}
                                              className="pl-2"
                                            >
                                              {levelData.classes.map(
                                                (classItem) => (
                                                  <CommandItem
                                                    key={classItem.id}
                                                    value={
                                                      classItem.name +
                                                      (classItem.speciality
                                                        ? ` ${classItem.speciality}`
                                                        : "")
                                                    }
                                                    onSelect={() => {
                                                      setSelectedClass(
                                                        classItem
                                                      );
                                                      setOpen(false); // Close the popover when a class is selected
                                                    }}
                                                  >
                                                    {formatClassName(classItem)}
                                                  </CommandItem>
                                                )
                                              )}
                                            </CommandGroup>
                                          </div>
                                        )
                                      )}
                                    </CommandGroup>
                                  </div>
                                ))}
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

                {/* Subject Selection */}
                <FormField
                  control={form.control}
                  name="subject_id"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>
                        {t("courseOfferings.create.subject")}
                      </FormLabel>
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
                              placeholder={t(
                                "courseOfferings.create.searchSubject"
                              )}
                              className="h-9"
                            />
                            <CommandList>
                              <CommandEmpty>
                                {t("courseOfferings.create.noSubjectFound")}
                              </CommandEmpty>
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

                {/* Student Selection */}
                <FormField
                  control={form.control}
                  name="student_id"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>
                        {t("courseOfferings.create.student")}
                      </FormLabel>
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
                            >
                              {field.value && students
                                ? students.find(
                                    (student) => student.id === field.value
                                  )?.email
                                : t("courseOfferings.create.selectStudent")}
                              <ArrowLeft className="ml-2 h-4 w-4 shrink-0 opacity-50 rotate-90" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-full p-0" align="start">
                          <Command>
                            <CommandInput
                              placeholder={t(
                                "courseOfferings.create.searchStudent"
                              )}
                              className="h-9"
                            />
                            <CommandList>
                              <CommandEmpty>
                                {t("courseOfferings.create.noStudentFound")}
                              </CommandEmpty>
                              <CommandGroup>
                                {!studentsLoading &&
                                  students?.map((student) => (
                                    <CommandItem
                                      key={student.id}
                                      value={`${student.first_name} ${student.last_name} ${student.email}`}
                                      onSelect={() => {
                                        form.setValue("student_id", student.id);
                                        setStudentOpen(false); // Close the popover when a student is selected
                                      }}
                                    >
                                      {student.first_name} {student.last_name} (
                                      {student.email})
                                    </CommandItem>
                                  ))}
                              </CommandGroup>
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
                      <FormLabel>
                        {t("courseOfferings.create.startDate")}
                      </FormLabel>
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
                                <span>
                                  {t("courseOfferings.create.pickDate")}
                                </span>
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
                      <FormLabel>
                        {t("courseOfferings.create.duration")}
                      </FormLabel>
                      <FormControl>
                        <div className="space-y-3">
                          <Slider
                            min={1}
                            max={5}
                            step={0.5}
                            value={[field.value]}
                            onValueChange={(values) =>
                              field.onChange(values[0])
                            }
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
                              ? `${field.value} ${
                                  field.value === 1
                                    ? t("courseOfferings.create.hour")
                                    : t("courseOfferings.create.hours")
                                }`
                              : `${Math.floor(field.value)}h ${Math.round(
                                  (field.value % 1) * 60
                                )}min`}
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
                      <FormLabel>
                        {t("courseOfferings.create.frequency")}
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="1"
                          max="7"
                          placeholder={t("courseOfferings.create.frequency")}
                          onKeyDown={(e) => {
                            // Prevent negative values by blocking the minus key and non-numeric keys
                            if (
                              e.key === "-" ||
                              (!/^[0-9]$/.test(e.key) &&
                                ![
                                  "Backspace",
                                  "Delete",
                                  "ArrowLeft",
                                  "ArrowRight",
                                  "Tab",
                                ].includes(e.key))
                            ) {
                              e.preventDefault();
                            }
                          }}
                          onChange={(e) => {
                            const value = e.target.value.replace(/[^0-9]/g, "");
                            field.onChange(value ? parseInt(value, 10) : "");
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
                      <FormLabel>
                        {t("courseOfferings.create.hourlyRate")}
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="1000"
                          placeholder={t("courseOfferings.create.hourlyRate")}
                          onKeyDown={(e) => {
                            // Prevent negative values by blocking the minus key and non-numeric keys
                            if (
                              e.key === "-" ||
                              (!/^[0-9]$/.test(e.key) &&
                                ![
                                  "Backspace",
                                  "Delete",
                                  "ArrowLeft",
                                  "ArrowRight",
                                  "Tab",
                                ].includes(e.key))
                            ) {
                              e.preventDefault();
                            }
                          }}
                          onChange={(e) => {
                            const value = e.target.value.replace(/[^0-9]/g, "");
                            field.onChange(value ? parseInt(value, 10) : "");
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

                {/* Is Available toggle */}
                <FormField
                  control={form.control}
                  name="is_available"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                      <div className="space-y-0.5">
                        <FormLabel>
                          {t("courseOfferings.edit.availability")}
                        </FormLabel>
                        <FormDescription>
                          {t("courseOfferings.edit.availabilityDescription")}
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              <CardFooter className="flex justify-between px-0">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                >
                  {t("courseOfferings.create.cancel")}
                </Button>
                <Button type="submit" disabled={mutation.isPending}>
                  {mutation.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {t("courseOfferings.edit.submit")}
                </Button>
              </CardFooter>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
