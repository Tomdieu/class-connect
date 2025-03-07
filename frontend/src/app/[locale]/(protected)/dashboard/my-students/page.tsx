"use client";

import React, { useState, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { listSchoolYear, getMyStudents } from "@/actions/enrollments";
import { SchoolYearType, TeacherStudentEnrollmentType } from "@/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";

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
  // Format last class date
  /* Commented out last_course_date related code as requested */

  return (
    <div className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm mb-4">
      <div className="flex-1">
        <h3 className="text-lg font-medium">
          {student.student?.user?.first_name} {student.student?.user?.last_name}
        </h3>
        <div className="flex gap-2 mt-2">
          <Badge text={student.student?.grade?.name || "N/A"} variant="blue" />
          <Badge
            text={
              student.offer?.subjects.map((s) => s.name).join(" / ") || "N/A"
            }
            variant="blue"
          />
          <Badge text={student.student?.school?.name || "N/A"} variant="cyan" />
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
        <ChevronDown className="h-5 w-5 text-gray-500" />
      </button>
    </div>
  );
};

const StudentsPage: React.FC = () => {
  const [showActiveOnly, setShowActiveOnly] = useState<boolean>(true);
  const [selectedYear, setSelectedYear] = useState<string>("");

  // Fetch school years with Tanstack Query
  const { 
    data: schoolYears = [],
    isLoading: schoolYearsLoading 
  } = useQuery<SchoolYearType[], Error>({
    queryKey: ['schoolYears'],
    queryFn: listSchoolYear,
  });

  // Effect to set the selected school year when data is loaded
  useEffect(() => {
    if (schoolYears.length > 0 && !selectedYear) {
      // Find the current school year based on the logic or fallback to the first year
      const currentSchoolYearFormatted = getCurrentSchoolYear();
      const currentYear = schoolYears.find(
        (year) => year.formatted_year === currentSchoolYearFormatted
      ) || schoolYears[0];
      
      setSelectedYear(currentYear.formatted_year);
    }
  }, [schoolYears, selectedYear]);

  // Fetch students with Tanstack Query
  const {
    data: allStudents = [],
    isLoading: studentsLoading,
    error: studentsError
  } = useQuery<TeacherStudentEnrollmentType[], Error>({
    queryKey: ['students'],
    queryFn: getMyStudents,
    enabled: !!selectedYear // Only fetch when a year is selected
  });

  // Filter students based on selected school year and active status
  const students = allStudents.filter((student) => {
    const matchesYear = student.school_year.formatted_year === selectedYear;
    const isActive = !showActiveOnly || !student.has_class_end;
    return matchesYear && isActive;
  });

  const loading = schoolYearsLoading || studentsLoading;
  const error = studentsError ? "Failed to load students" : "";

  return (
    <div className="p-6 w-full container mx-auto">
      <h1 className="text-2xl font-bold mb-6">Mes élèves</h1>

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
                  Année scolaire
                </span>
                <span className="text-sm font-medium">{selectedYear ? selectedYear :"Sélectionner une année scolaire"}</span>
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
            <div>Élèves actifs seulement</div>
            <div className="text-sm text-gray-500">
              Décocher pour afficher les élèves dont les cours sont terminés.
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8">Chargement des élèves...</div>
      ) : error ? (
        <div className="text-center text-red-500 py-8">{error}</div>
      ) : students.length === 0 ? (
        <div className="text-center py-8">
          Aucun élève trouvé pour cette année scolaire.
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
