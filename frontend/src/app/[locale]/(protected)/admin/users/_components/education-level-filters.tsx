"use client";

import { useI18n } from "@/locales/client";
import { usePathname, useSearchParams } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { GraduationCap } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useEffect, useState } from "react";
import { getSections } from "@/actions/sections";
import { getformatedClasses } from "@/actions/courses";
import type { Section, ClassStructure, SectionDetail, ClassDetail } from "@/types";

const EducationLevelFilters = () => {
  const t = useI18n();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Updated to match the URL parameter used in user-table.tsx
  const userType = searchParams.get("type") || "all";
  const selectedSection = searchParams.get("section") || "";
  const selectedLevel = searchParams.get("education_level") || "";
  const selectedClass = searchParams.get("class_name") || "";

  // State for fetched data
  const [sections, setSections] = useState<Section[]>([]);
  const [classStructure, setClassStructure] = useState<ClassStructure | null>(null);
  const [loading, setLoading] = useState(true);
  const [educationLevels, setEducationLevels] = useState<{ code: string; label: string }[]>([]);
  const [groupedClasses, setGroupedClasses] = useState<{
    [speciality: string]: ClassDetail[];
  }>({});

  // Fetch data on component mount
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Get all the data we need
        const [sectionsData, formattedClasses] = await Promise.all([getSections(), getformatedClasses()]);

        setSections(sectionsData);
        setClassStructure(formattedClasses);

        // If we have a selected section, get the education levels for that section
        if (selectedSection && formattedClasses) {
          const sectionDetail = Object.values(formattedClasses).find(
            (section) => section.code === selectedSection
          );

          if (sectionDetail) {
            // Extract education levels for this section
            const levels = extractEducationLevels(sectionDetail);
            setEducationLevels(levels);

            // If we have a selected education level, get the classes for that level
            if (selectedLevel) {
              const classes = extractGroupedClassesForLevel(sectionDetail, selectedLevel);
              setGroupedClasses(classes);
            } else {
              setGroupedClasses({});
            }
          }
        } else {
          setEducationLevels([]);
          setGroupedClasses({});
        }
      } catch (error) {
        console.error("Failed to load filter data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedSection, selectedLevel]);

  // Helper function to extract education levels from a section
  const extractEducationLevels = (sectionDetail: SectionDetail) => {
    const levels: { code: string; label: string }[] = [];

    // Go through each level in the section
    Object.entries(sectionDetail.levels).forEach(([key, level]) => {
      levels.push({
        code: level.code,
        label: level.label,
      });
    });

    return levels;
  };

  // Helper function to extract and group classes by speciality for a selected education level
  const extractGroupedClassesForLevel = (sectionDetail: SectionDetail, levelCode: string) => {
    const grouped: { [speciality: string]: ClassDetail[] } = {};
    
    // Find the education level in the section
    const level = Object.values(sectionDetail.levels).find(level => level.code === levelCode);
    
    if (level && level.groups) {
      // Add default group for classes not in a speciality
      if (level.groups.classes && level.groups.classes.length > 0) {
        grouped["general"] = level.groups.classes;
      }
      
      // Add specialized groups (like LYCEE's specialities)
      Object.entries(level.groups).forEach(([groupKey, group]) => {
        if (groupKey !== "classes" && Array.isArray(group) && group.length > 0) {
          grouped[groupKey] = group;
        }
      });
    }
    
    return grouped;
  };

  // Updated condition to match the value used in user-table.tsx
  if (userType !== "student") {
    return null;
  }

  const createQueryString = (params: Record<string, string | null>) => {
    const newParams = new URLSearchParams(searchParams);
    Object.entries(params).forEach(([key, value]) => {
      if (value === null) {
        newParams.delete(key);
      } else {
        newParams.set(key, value);
      }
    });
    newParams.set("page", "1");
    return newParams.toString();
  };

  if (loading) {
    return <div className="p-4 text-gray-500">Loading filters...</div>;
  }

  return (
    <Accordion
      type="single"
      collapsible
      className="bg-white rounded-lg border shadow-sm"
      defaultValue="educationFilters"
    >
      <AccordionItem value="educationFilters" className="border-0">
        <AccordionTrigger className="px-4 py-3 hover:bg-gray-50 hover:no-underline">
          <div className="flex items-center">
            <GraduationCap className="h-4 w-4 mr-2 text-primary" />
            <h3 className="text-lg font-medium">{t("users.educationFilters") || "Education Filters"}</h3>
          </div>
        </AccordionTrigger>
        <AccordionContent className="px-4 pb-4">
          <div className="space-y-5">
            {/* Section Selection */}
            <div>
              <h4 className="font-medium text-sm text-gray-700 mb-2">
                {t("users.section") || "Section"}:
              </h4>
              <div className="flex flex-wrap gap-2">
                {sections.map((section) => {
                  const isActive = selectedSection === section.code;
                  return (
                    <Link
                      key={section.code}
                      href={`${pathname}?${createQueryString({
                        section: isActive ? null : section.code,
                        education_level: null,
                        class_name: null,
                      })}`}
                      className={cn(
                        "px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
                        isActive
                          ? "bg-primary text-primary-foreground"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      )}
                    >
                      {section.label}
                    </Link>
                  );
                })}
                {selectedSection && (
                  <Link
                    href={`${pathname}?${createQueryString({
                      section: null,
                      education_level: null,
                      class_name: null,
                    })}`}
                    className="px-3 py-1.5 rounded-md text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                  >
                    {t("users.clearFilters") || "Clear Filters"}
                  </Link>
                )}
              </div>
            </div>
            
            {/* Education Level Selection - Only show when a section is selected */}
            {selectedSection && educationLevels.length > 0 && (
              <div>
                <h4 className="font-medium text-sm text-gray-700 mb-2">
                  {t("users.educationLevel") || "Education Level"}:
                </h4>
                <div className="flex flex-wrap gap-2">
                  {educationLevels.map((level) => {
                    const isActive = selectedLevel === level.code;
                    return (
                      <Link
                        key={level.code}
                        href={`${pathname}?${createQueryString({
                          section: selectedSection,
                          education_level: isActive ? null : level.code,
                          class_name: null,
                        })}`}
                        className={cn(
                          "px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
                          isActive
                            ? "bg-primary text-primary-foreground"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        )}
                      >
                        {level.label}
                      </Link>
                    );
                  })}
                  {selectedLevel && (
                    <Link
                      href={`${pathname}?${createQueryString({
                        section: selectedSection,
                        education_level: null,
                        class_name: null,
                      })}`}
                      className="px-3 py-1.5 rounded-md text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                    >
                      {t("users.clearFilters") || "Clear Filters"}
                    </Link>
                  )}
                </div>
              </div>
            )}
            
            {/* Class Name Selection - Now grouped by speciality when available */}
            {selectedSection && selectedLevel && Object.keys(groupedClasses).length > 0 && (
              <div>
                <h4 className="font-medium text-sm text-gray-700 mb-2">
                  {t("users.className") || "Class Name"}:
                </h4>
                {Object.entries(groupedClasses).map(([groupKey, classes]) => (
                  <div key={groupKey} className="mb-4">
                    {/* Show speciality name if not "general" */}
                    {groupKey !== "general" && (
                      <h5 className="font-medium text-xs text-gray-600 mb-1 ml-1 uppercase">
                        {t(`users.${groupKey}`) || groupKey}:
                      </h5>
                    )}
                    <div className="flex flex-wrap gap-2">
                      {classes.map((cls) => {
                        // Use definition_display for display name and matching
                        const isActive = selectedClass === cls.definition_display;
                        return (
                          <Link
                            key={cls.id}
                            href={`${pathname}?${createQueryString({
                              section: selectedSection,
                              education_level: selectedLevel,
                              class_name: isActive ? null : cls.definition_display,
                            })}`}
                            className={cn(
                              "px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
                              isActive
                                ? "bg-primary text-primary-foreground"
                                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                            )}
                          >
                            {cls.definition_display}
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                ))}
                {selectedClass && (
                  <Link
                    href={`${pathname}?${createQueryString({
                      section: selectedSection,
                      education_level: selectedLevel,
                      class_name: null,
                    })}`}
                    className="px-3 py-1.5 rounded-md text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors mt-2 inline-block"
                  >
                    {t("users.clearFilters") || "Clear Filters"}
                  </Link>
                )}
              </div>
            )}
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};

export default EducationLevelFilters;
