"use client";

import React, { useState, useEffect } from "react";
import { ChevronDown, X, ChevronLeft, ChevronRight, Filter } from "lucide-react";
import { listSchoolYear, getMyStudents, createEnrollmentDeclaration, listEnrollmentDeclarations } from "@/actions/enrollments";
import { SchoolYearType, TeacherStudentEnrollmentType, CourseDeclarationType, PaginationType, ActionStatus } from "@/types";
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
import { format } from "date-fns";
import { enUS, fr } from 'date-fns/locale';

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
  const locale = t === useI18n() ? enUS : fr;
  const [selectedMonth, setSelectedMonth] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [filterOpen, setFilterOpen] = useState(false);
  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
    status: ""
  });

  const toggleAccordion = () => {
    setIsOpen(!isOpen);
  };

  // Fetch declarations for this enrollment with pagination and filters
  const { data: declarationsData, isLoading: declarationsLoading } = useQuery({
    queryKey: ["declarations", student.id, currentPage, pageSize, filters],
    queryFn: () => listEnrollmentDeclarations(student.id, {
      page: currentPage,
      page_size: pageSize,
      status: filters.status as ActionStatus || undefined,
      // Transform flat filters to the expected nested structure
      ...(filters.startDate || filters.endDate ? {
        declaration_date: {
          from: filters.startDate ? new Date(filters.startDate) : undefined,
          to: filters.endDate ? new Date(filters.endDate) : undefined
        }
      } : {})
    }),
    enabled: isOpen && activeTab === "Cours",
  });

  // Group declarations by month
  const declarationsByMonth = React.useMemo(() => {
    if (!declarationsData?.results || declarationsData.results.length === 0) return {};
    
    const grouped = declarationsData.results.reduce((acc, declaration) => {
      const date = new Date(declaration.declaration_date);
      const monthKey = `${date.getMonth() + 1}-${date.getFullYear()}`;
      const monthDisplay = format(date, 'MMMM yyyy', { locale });
      
      if (!acc[monthKey]) {
        acc[monthKey] = {
          display: monthDisplay,
          declarations: []
        };
      }
      
      acc[monthKey].declarations.push(declaration);
      return acc;
    }, {} as Record<string, { display: string, declarations: CourseDeclarationType[] }>);
    
    return grouped;
  }, [declarationsData, locale]);

  // Set default selected month when data loads
  useEffect(() => {
    if (Object.keys(declarationsByMonth).length > 0 && !selectedMonth) {
      setSelectedMonth(Object.keys(declarationsByMonth)[0]);
    }
  }, [declarationsByMonth, selectedMonth]);

  // Format a declaration date
  const formatDeclarationDate = (dateString: string) => {
    return format(new Date(dateString), 'dd MMM yyyy', { locale });
  };

  // Format duration from minutes to hours and minutes
  const formatDurationFromMinutes = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    if (remainingMinutes === 0) {
      return `${hours}h`;
    }
    return `${hours}h ${remainingMinutes}m`;
  };

  const formSchema = z.object({
    declaration_date: z.string().nonempty({ message: t("form.errors.dateRequired") }),
    duration: z.coerce.number().min(1).max(5, { message: t("form.errors.durationRange") }),
  });

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      declaration_date: "",
      duration: "1",
    },
  });

  const mutation = useMutation({
    mutationFn: (data: { enrollmentId: number, data: { duration: number, declaration_date: string } }) => 
      createEnrollmentDeclaration(data),
    onSuccess: () => {
      setIsOpen(false);
    },
    onError: () => {
      // Handle error (e.g., show error message)
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    mutation.mutate({
      enrollmentId: student.id,
      data: {
        duration: Number(values.duration) * 60, // Convert hours to minutes
        declaration_date: values.declaration_date,
      },
    });
  };

  const formatDuration = (hours: number) => {
    const hr = Math.floor(hours);
    const min = (hours - hr) * 60;
    return min ? `${hr}h ${min}m` : `${hr}h`;
  };

  // Handle filter changes
  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Apply filters and reset to page 1
  const applyFilters = () => {
    setCurrentPage(1);
    setFilterOpen(false);
  };

  // Reset filters
  const resetFilters = () => {
    setFilters({
      startDate: "",
      endDate: "",
      status: ""
    });
    setCurrentPage(1);
    setFilterOpen(false);
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
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium">{t("course.history")}</h4>
                    <button 
                      onClick={() => setFilterOpen(!filterOpen)}
                      className="text-blue-500 flex items-center text-sm"
                    >
                      <Filter className="h-4 w-4 mr-1" />
                      {t("common.filter")}
                    </button>
                  </div>
                  
                  {filterOpen && (
                    <div className="mt-2 p-4 border rounded-md bg-gray-50">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            {t("filter.startDate")}
                          </label>
                          <input
                            type="date"
                            name="startDate"
                            value={filters.startDate}
                            onChange={handleFilterChange}
                            className="w-full p-2 border rounded-md"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            {t("filter.endDate")}
                          </label>
                          <input
                            type="date"
                            name="endDate"
                            value={filters.endDate}
                            onChange={handleFilterChange}
                            className="w-full p-2 border rounded-md"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            {t("filter.status")}
                          </label>
                          <select
                            name="status"
                            value={filters.status}
                            onChange={handleFilterChange}
                            className="w-full p-2 border rounded-md"
                          >
                            <option value="">{t("filter.allStatuses")}</option>
                            <option value="PENDING">{t("status.pending")}</option>
                            <option value="ACCEPTED">{t("status.approved")}</option>
                            <option value="REJECTED">{t("status.rejected")}</option>
                            <option value="PAID">{t("status.paid")}</option>

                          </select>
                        </div>
                      </div>
                      <div className="flex justify-end mt-4 space-x-2">
                        <button
                          onClick={resetFilters}
                          className="px-3 py-1 border border-gray-300 rounded-md text-sm"
                        >
                          {t("filter.reset")}
                        </button>
                        <button
                          onClick={applyFilters}
                          className="px-3 py-1 bg-blue-500 text-white rounded-md text-sm"
                        >
                          {t("filter.apply")}
                        </button>
                      </div>
                    </div>
                  )}
                  
                  {declarationsLoading ? (
                    <div className="mt-2 text-sm text-gray-500">Loading...</div>
                  ) : declarationsData?.results && declarationsData.results.length > 0 ? (
                    <>
                      <Select
                        value={selectedMonth}
                        onValueChange={setSelectedMonth}
                      >
                        <SelectTrigger className="mt-2 w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(declarationsByMonth).map(([key, { display }]) => (
                            <SelectItem key={key} value={key}>
                              {display}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      
                      {selectedMonth && declarationsByMonth[selectedMonth] && (
                        <div className="mt-4 space-y-3">
                          {declarationsByMonth[selectedMonth].declarations.map(declaration => (
                            <div key={declaration.id} className="p-3 bg-blue-50 rounded-md border border-blue-100">
                              <div className="flex justify-between">
                                <span className="font-medium">{formatDeclarationDate(declaration.declaration_date)}</span>
                                <span>{formatDurationFromMinutes(declaration.duration)}</span>
                              </div>
                              <div className="mt-1 text-sm text-gray-500">
                                Status: <span className="font-medium">{declaration.status}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {/* Pagination controls */}
                      <div className="mt-6 flex items-center justify-between">
                        <div className="text-sm text-gray-600">
                          {t("pagination.showing")} {(currentPage - 1) * pageSize + 1}-
                          {Math.min(currentPage * pageSize, declarationsData.count)} {t("pagination.of")} {declarationsData.count}
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                            className={`p-1 rounded-full ${
                              currentPage === 1 
                                ? 'text-gray-300 cursor-not-allowed' 
                                : 'text-gray-700 hover:bg-gray-100'
                            }`}
                            aria-label="Previous page"
                          >
                            <ChevronLeft className="h-5 w-5" />
                          </button>
                          
                          <span className="text-sm px-2">
                            {currentPage} / {Math.ceil(declarationsData.count / pageSize) || 1}
                          </span>
                          
                          <button
                            onClick={() => setCurrentPage(prev => 
                              prev < Math.ceil(declarationsData.count / pageSize) ? prev + 1 : prev
                            )}
                            disabled={currentPage >= Math.ceil(declarationsData.count / pageSize)}
                            className={`p-1 rounded-full ${
                              currentPage >= Math.ceil(declarationsData.count / pageSize) 
                                ? 'text-gray-300 cursor-not-allowed' 
                                : 'text-gray-700 hover:bg-gray-100'
                            }`}
                            aria-label="Next page"
                          >
                            <ChevronRight className="h-5 w-5" />
                          </button>
                        </div>
                        
                        <div>
                          <select
                            value={pageSize}
                            onChange={(e) => {
                              setPageSize(Number(e.target.value));
                              setCurrentPage(1);
                            }}
                            className="text-sm p-1 border rounded"
                            aria-label="Items per page"
                          >
                            {[5, 10, 25, 50].map(size => (
                              <option key={size} value={size}>
                                {size} {t("pagination.perPage")}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="mt-4 p-4 bg-blue-100 rounded">
                      {t("course.noDeclared")}
                    </div>
                  )}
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
