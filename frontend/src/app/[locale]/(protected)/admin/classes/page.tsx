"use client";
import { getformatedClasses } from "@/actions/courses";
import { SchoolStructure, Section } from "@/types";
import { useQuery } from "@tanstack/react-query";
import { ChevronDown, ChevronRight, Loader } from "lucide-react";
import { useI18n } from "@/locales/client";
import Link from "next/link";
import { useClassStore } from "@/hooks/class-store";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import React, { useState } from "react";

function CoursesPages() {
  const { data, isError, isLoading, error } = useQuery({
    queryKey: ["formatted-classes"],
    queryFn: () => getformatedClasses(),
  });
  const t = useI18n();
  const { onAdd } = useClassStore();
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});

  if (isLoading) {
    return (
      <div className="container flex justify-center items-center h-screen">
        <Loader className="animate-spin size-8" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="container flex justify-center items-center h-screen">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          <strong className="font-bold">{t("error")}: </strong>
          <span className="block sm:inline">{error.message}</span>
        </div>
      </div>
    );
  }

  const toggleSection = (sectionId: string) => {
    setOpenSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  const renderClassCard = (c: any, section: Section) => (
    <Link href={`/admin/classes/${c.id}/`}>
      <div className="p-5 h-[150px] rounded-md shadow-md hover:shadow-lg transition-all duration-300 bg-white/80 backdrop-blur-sm border border-gray-100 hover:scale-105">
        <h4 className="text-xl font-medium mb-2">{c.name}</h4>
        <p className="text-sm text-gray-600 line-clamp-2 mb-3">
          {c.description}
        </p>
        <span className="text-xs text-gray-500">{t(`sections.${section}`)}</span>
      </div>
    </Link>
  );

  const renderLevelSection = (title: string, classes: any[], section: Section, sectionId: string) => {
    if (classes.length === 0) return null;
    
    return (
      <Collapsible
        key={sectionId} // Add key here
        open={openSections[sectionId]}
        onOpenChange={() => toggleSection(sectionId)}
        className="space-y-2"
      >
        <CollapsibleTrigger className="flex items-center w-full gap-2 p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
          {openSections[sectionId] ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <span className="text-sm text-gray-500 ml-2">
            ({classes.length} {classes.length === 1 ? 'class' : 'classes'})
          </span>
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-4 pt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pl-6">
            {classes.map(c => (
              <div key={c.id}>
                {renderClassCard(c, section)}
              </div>
            ))}
          </div>
        </CollapsibleContent>
      </Collapsible>
    );
  };

  const renderSectionContent = (structure: SchoolStructure, section: Section) => {
    return (
      <div className="space-y-6">
        {/* College Section */}
        {renderLevelSection(
          `${t("educationLevels.college")}`,
          structure[section].COLLEGE.classes,
          section,
          `${section}-college`
        )}

        {/* Lycee Sections */}
        {Object.entries(structure[section].LYCEE).map(([speciality, classes]) => (
          <React.Fragment key={`${section}-lycee-${speciality}`}>
            {renderLevelSection(
              `${t("educationLevels.lycee")} - ${speciality}`,
              classes,
              section,
              `${section}-lycee-${speciality}`
            )}
          </React.Fragment>
        ))}

        {/* University Sections */}
        {Object.entries(structure[section].UNIVERSITY).map(([level, classes]) => (
          <React.Fragment key={`${section}-university-${level}`}>
            {renderLevelSection(
              `${t("educationLevels.university")} - ${level}`,
              classes,
              section,
              `${section}-university-${level}`
            )}
          </React.Fragment>
        ))}
      </div>
    );
  };

  return (
    <div className="container px-1 sm:px-8 py-10">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-medium">{t("class.title")}</h1>
        <Button 
          onClick={onAdd}
          className="bg-default hover:bg-default/90 text-white"
        >
          {t("plans.actions.add")}
        </Button>
      </div>

      <div className="space-y-12">
        {Object.entries(data).map(([section, sectionData]) => (
          <div key={section} className="bg-white rounded-xl px-2 p-6 shadow-sm">
            <h2 className="text-2xl font-semibold mb-6 text-gray-900">
              {t(`sections.${section}`)}
            </h2>
            {renderSectionContent(data, section as Section)}
          </div>
        ))}
      </div>
    </div>
  );
}

export default CoursesPages;
