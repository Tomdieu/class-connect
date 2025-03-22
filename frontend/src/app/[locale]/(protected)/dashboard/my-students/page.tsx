"use client";

import React, { useState, useEffect } from "react";
import { ChevronDown, X } from "lucide-react";
import { listSchoolYear, getMyStudents, createEnrollmentDeclaration } from "@/actions/enrollments";
import { SchoolYearType, TeacherStudentEnrollmentType } from "@/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Credenza,
  CredenzaTrigger,
  CredenzaClose,
  CredenzaContent,
  CredenzaDescription,
  CredenzaFooter,
  CredenzaHeader,
  CredenzaTitle,
} from "@/components/ui/credenza";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { useI18n } from "@/locales/client";

// Helper function to determine current school year
const getCurrentSchoolYear = (): string => {
  const today = new Date();
  const currentYear = today.getFullYear();
  const startYear = today.getMonth() >= 8 ? currentYear : currentYear - 1; // Month is 0-based, so 8 is September
  const endYear = startYear + 1;
  return `${startYear}-${endYear}`;
};

interface BadgeProps {
  text: string;
  variant: "blue" | "green" | "red" | "cyan" | "default";
}

const Badge: React.FC<BadgeProps> = ({ text, variant }) => {
  const getVariantClasses = (): string => {
    switch (variant) {
      case "blue":
        return "bg-blue-100 text-blue-800";
      case "green":
        return "bg-green-100 text-green-800";
      case "red":
        return "bg-red-100 text-red-800";
      case "cyan":
        return "bg-cyan-100 text-cyan-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <span className={`px-2 py-1 rounded-md text-sm ${getVariantClasses()}`}>
      {text}
    </span>
  );
};

interface SwitchProps {
  checked: boolean;
  onChange: (value: boolean) => void;
}

const Switch: React.FC<SwitchProps> = ({ checked, onChange }) => (
  <button
    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
      checked ? "bg-green-500" : "bg-gray-200"
    }`}
    onClick={() => onChange(!checked)}
  >
    <span
      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
        checked ? "translate-x-6" : "translate-x-1"
      }`}
    />
  </button>
);

interface StudentCardProps {
  student: TeacherStudentEnrollmentType;
}

const StudentCard: React.FC<StudentCardProps> = ({ student }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("Cours");
  const t = useI18n();

  const toggleAccordion = () => {
    setIsOpen(!isOpen);
  };

  const formSchema = z.object({
    declaration_date: z.string().nonempty({ message: t("form.errors.dateRequired") }),
    duration: z.number().min(1).max(5, { message: t("form.errors.durationRange") }),
  });

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      declaration_date: "",
      duration: 1,
    },
  });

  const mutation = useMutation({
    mutationFn: (data: { enrollmentId: number, data: { duration: number, declaration_date: string } }) => 
      createEnrollmentDeclaration(data),
    onSuccess: () => {
      // Handle success (e.g., close dialog, show success message)
    },
    onError: () => {
      // Handle error (e.g., show error message)
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    mutation.mutate({
      enrollmentId: student.id,
      data: {
        duration: values.duration * 60, // Convert hours to minutes
        declaration_date: values.declaration_date,
      },
    });
  };

  const formatDuration = (hours: number) => {
    const hr = Math.floor(hours);
    const min = (hours - hr) * 60;
    return min ? `${hr}h ${min}m` : `${hr}h`;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm mb-4">
      <div
        className="flex items-center justify-between p-4 cursor-pointer"
        onClick={toggleAccordion}
      >
        <div className="flex-1 flex items-center justify-between">
          <h3 className="text-lg font-medium">
            {student.offer.student.first_name} {student.offer.student.last_name}
          </h3>
          <div className="flex items-center justify-between">
            <div className="flex gap-2 mt-2 select-none">
              <Badge
                text={student.offer.class_level.name || "N/A"}
                variant="blue"
              />
              <Badge
                text={student.offer.subject.name || "N/A"}
                variant="blue"
              />
              <Badge
                text={student.offer.student.class_display || "N/A"}
                variant="cyan"
              />
              {/* Commented out last_course_date badge
            <Badge
              text={lastClassText}
              variant={
                !student.last_course_date || diffDays > 7 ? "red" : "green"
              }
            />
            */}
            </div>
            
          </div>
          <button className="p-2">
              <ChevronDown
                className={`h-5 w-5 text-gray-500 transition-transform ${
                  isOpen ? "rotate-180" : ""
                }`}
              />
            </button>
        </div>
      </div>
      {isOpen && (
        <div className="p-4 border-t">
          <div className="flex gap-1 mb-4 border-b">
            <button
              className={`px-4 py-2 rounded-t ${
                activeTab === "Cours"
                  ? "bg-white text-blue-500 border-b-2 border-blue-500"
                  : "text-gray-500"
              }`}
              onClick={() => setActiveTab("Cours")}
            >
              {t("tabs.courses")}
            </button>
            <button
              className={`px-4 py-2 rounded-t ${
                activeTab === "Suivis"
                  ? "bg-white text-blue-500 border-b-2 border-blue-500"
                  : "text-gray-500"
              }`}
              onClick={() => setActiveTab("Suivis")}
            >
              {t("tabs.followUps")}
            </button>
            <button
              className={`px-4 py-2 rounded-t ${
                activeTab === "Coordonnées"
                  ? "bg-white text-blue-500 border-b-2 border-blue-500"
                  : "text-gray-500"
              }`}
              onClick={() => setActiveTab("Coordonnées")}
            >
              {t("tabs.contactInfo")}
            </button>
          </div>
          <div>
            {activeTab === "Cours" && (
              <div>
                <p>
                  {t("course.hourlyRate")}: {student.offer.hourly_rate} XAF
                </p>
                <Credenza>
                  <CredenzaTrigger asChild>
                    <Button className="mt-4 px-4 py-2 bg-purple-500 text-white rounded">
                      {t("course.declare")}
                    </Button>
                  </CredenzaTrigger>
                  <CredenzaContent>
                    <CredenzaHeader>
                      <CredenzaTitle>{t("course.declare")}</CredenzaTitle>
                      
                    </CredenzaHeader>
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                          name="declaration_date"
                          control={form.control}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{t("form.date")}</FormLabel>
                              <FormControl>
                                <Input type="date" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          name="duration"
                          control={form.control}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{t("form.duration")}</FormLabel>
                              <FormControl>
                                <Select onValueChange={field.onChange} defaultValue={field.value.toString()}>
                                  <SelectTrigger>
                                    <SelectValue placeholder={t("form.selectDuration")} />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {[1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5].map((hour) => (
                                      <SelectItem key={hour} value={hour.toString()}>
                                        {formatDuration(hour)}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <CredenzaFooter>
                          <Button type="submit">{t("form.submit")}</Button>
                        </CredenzaFooter>
                      </form>
                    </Form>
                  </CredenzaContent>
                </Credenza>
                <button className="mt-4 ml-2 px-4 py-2 bg-blue-500 text-white rounded">
                  {t("course.reportEnd")}
                </button>
                <div className="mt-4">
                  <h4 className="font-medium">{t("course.history")}</h4>
                  <select className="mt-2 p-2 border rounded">
                    <option>{t("course.march2025")}</option>
                  </select>
                  <div className="mt-4 p-4 bg-blue-100 rounded">
                    {t("course.noDeclared")}
                  </div>
                </div>
              </div>
            )}
            {activeTab === "Suivis" && (
              <div>
                <p>{t("followUps.content")}</p>
              </div>
            )}
            {activeTab === "Coordonnées" && (
              <div>
                <p>{t("contactInfo.content")}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const StudentsPage: React.FC = () => {
  const [showActiveOnly, setShowActiveOnly] = useState<boolean>(true);
  const [selectedYear, setSelectedYear] = useState<string>("");
  const t = useI18n();

  // Fetch school years with Tanstack Query
  const { data: schoolYears = [], isLoading: schoolYearsLoading } = useQuery<
    SchoolYearType[],
    Error
  >({
    queryKey: ["schoolYears"],
    queryFn: listSchoolYear,
  });

  // Effect to set the selected school year when data is loaded
  useEffect(() => {
    if (schoolYears.length > 0 && !selectedYear) {
      // Find the current school year based on the logic or fallback to the first year
      const currentSchoolYearFormatted = getCurrentSchoolYear();
      const currentYear =
        schoolYears.find(
          (year) => year.formatted_year === currentSchoolYearFormatted
        ) || schoolYears[0];

      setSelectedYear(currentYear.formatted_year);
    }
  }, [schoolYears, selectedYear]);

  // Fetch students with Tanstack Query
  const {
    data: allStudents = [],
    isLoading: studentsLoading,
    error: studentsError,
  } = useQuery<TeacherStudentEnrollmentType[], Error>({
    queryKey: ["students"],
    queryFn: getMyStudents,
    enabled: !!selectedYear, // Only fetch when a year is selected
  });

  console.log(allStudents);

  // Filter students based on selected school year and active status
  const students = allStudents.filter((student) => {
    const matchesYear = student.school_year.formatted_year === selectedYear;
    const isActive = !showActiveOnly || !student.has_class_end;
    return matchesYear && isActive;
  });

  const loading = schoolYearsLoading || studentsLoading;
  const error = studentsError ? t("error.failedToLoadStudents") : "";

  return (
    <div className="p-6 w-full container mx-auto">
      <h1 className="text-2xl font-bold mb-6">{t("studentsPage.title")}</h1>

      <div className="flex items-center justify-between mb-6">
        <div className="w-72">
          <Select
            value={selectedYear}
            onValueChange={setSelectedYear}
            disabled={loading || schoolYears.length === 0}
          >
            <SelectTrigger className="w-full py-2 px-2 rounded-sm">
              <div className="flex flex-col items-start justify-between w-full">
                <span className="text-muted-foreground text-sm">
                  {t("studentsPage.schoolYear")}
                </span>
                <span className="text-sm font-medium">
                  {selectedYear
                    ? selectedYear
                    : t("studentsPage.selectSchoolYear")}
                </span>
              </div>
            </SelectTrigger>
            <SelectContent>
              {schoolYears.map((year) => (
                <SelectItem
                  key={year.formatted_year}
                  value={year.formatted_year}
                >
                  {year.formatted_year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-4">
          <Switch checked={showActiveOnly} onChange={setShowActiveOnly} />
          <div>
            <div>{t("studentsPage.activeStudentsOnly")}</div>
            <div className="text-sm text-gray-500">
              {t("studentsPage.uncheckToShowAll")}
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8">{t("studentsPage.loading")}</div>
      ) : error ? (
        <div className="text-center text-red-500 py-8">{error}</div>
      ) : students.length === 0 ? (
        <div className="text-center py-8">
          {t("studentsPage.noStudentsFound")}
        </div>
      ) : (
        <div className="space-y-4">
          {students.map((student, index) => (
            <StudentCard key={student.id || index} student={student} />
          ))}
        </div>
      )}
    </div>
  );
};

export default StudentsPage;
