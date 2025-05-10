"use client";

import React, { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronRight, Users, Loader, ArrowLeft } from "lucide-react";
import { getformatedClasses, listSubjects } from "@/actions/courses";
import { ClassDetail, Section, ClassStructure, SubjectType } from "@/types";
import { useResourceBrowserStore } from "@/store/resource-browser-store";

const ResourceBrowser: React.FC = () => {
  const {
    selectedClass,
    setSelectedClass,
    activeTab,
    setActiveTab,
  } = useResourceBrowserStore();

  const [classesGroupedBySection, setClassesGroupedBySection] = useState<Record<"EN" | "FR", Record<string, Record<string, ClassDetail[]>>>>({
    EN: {},
    FR: {},
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [subjects, setSubjects] = useState<SubjectType[]>([]);
  const [isSubjectsLoading, setIsSubjectsLoading] = useState(false);

  // Fetch and group classes by section, group, and code
  useEffect(() => {
    const fetchClasses = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const classStructure: ClassStructure = await getformatedClasses();
        const groupedBySection: Record<"EN" | "FR", Record<string, Record<string, ClassDetail[]>>> = {
          EN: {},
          FR: {},
        };

        Object.entries(classStructure).forEach(([sectionCode, sectionData]) => {
          const code = sectionCode as "EN" | "FR";

          Object.values(sectionData.levels).forEach((levelData) => {
            const levelCode = levelData.code;

            Object.entries(levelData.groups).forEach(([groupKey, group]) => {
              if (Array.isArray(group)) {
                if (!groupedBySection[code][groupKey]) {
                  groupedBySection[code][groupKey] = {};
                }
                if (!groupedBySection[code][groupKey][levelCode]) {
                  groupedBySection[code][groupKey][levelCode] = [];
                }
                groupedBySection[code][groupKey][levelCode].push(...group);
              }
            });
          });
        });

        setClassesGroupedBySection(groupedBySection);
      } catch (err) {
        console.error("Error fetching formatted classes:", err);
        setError("Failed to load classes. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchClasses();
  }, []);

  // Fetch subjects for a selected class
  const fetchSubjects = async (classItem: ClassDetail) => {
    setIsSubjectsLoading(true);
    setSelectedClass(classItem);

    try {
      const fetchedSubjects = await listSubjects({ class_pk: classItem.id.toString() });
      setSubjects(fetchedSubjects);
    } catch (err) {
      console.error("Error fetching subjects:", err);
      setSubjects([]);
    } finally {
      setIsSubjectsLoading(false);
    }
  };

  // Render classes for a specific code
  const renderClasses = (classes: ClassDetail[]) => {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {classes.map((classItem) => (
          <Card
            key={classItem.id}
            className="hover:shadow-md transition-all cursor-pointer bg-card/95 backdrop-blur border-primary/20 relative overflow-hidden"
            onClick={() => fetchSubjects(classItem)}
          >
            <div className="absolute top-0 right-0 w-8 h-8 bg-primary/10 rounded-bl-lg"></div>
            <CardHeader className="pb-2">
              <CardTitle className="text-primary">{classItem.definition_display}</CardTitle>
              <CardDescription>{classItem.variant && `Variant: ${classItem.variant}`}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{classItem.description || "No description available"}</p>
            </CardContent>
            <CardFooter>
              <div className="flex justify-between items-center w-full">
                <Button className="bg-primary hover:bg-primary/90 text-white">View Subjects</Button>
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  };

  // Render codes for a specific group
  const renderCodes = (codes: Record<string, ClassDetail[]>) => {
    return Object.entries(codes).map(([codeName, classes]) => (
      <div key={codeName} className="mb-6">
        <h4 className="text-md font-medium mb-2 text-muted-foreground">{codeName.split('_')[1]}</h4>
        {renderClasses(classes)}
      </div>
    ));
  };

  // Render groups for a specific section
  const renderGroups = (groups: Record<string, Record<string, ClassDetail[]>>) => {
    return Object.entries(groups).map(([groupName, codes]) => (
      <div key={groupName} className="mb-6">
        <h3 className="text-lg font-semibold mb-4 text-primary">{groupName}</h3>
        {renderCodes(codes)}
      </div>
    ));
  };

  // Internal component to display subjects for a selected class
  const SubjectsView = () => {
    if (isSubjectsLoading) {
      return (
        <div className="flex justify-center items-center h-64">
          <Loader className="animate-spin h-8 w-8 text-primary" />
          <span className="ml-2 text-primary">Loading subjects...</span>
        </div>
      );
    }

    return (
      <div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setSelectedClass(null)}
          className="mb-4 flex items-center"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back
        </Button>

        <h2 className="text-xl font-semibold mb-4 text-primary">
          Subjects in {selectedClass?.definition_display}
        </h2>

        {subjects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {subjects.map((subject) => (
              <Card key={subject.id} className="hover:shadow-md transition-all cursor-pointer bg-card/95 backdrop-blur border-primary/20 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-8 h-8 bg-primary/10 rounded-bl-lg"></div>
                <CardHeader className="pb-2">
                  <CardTitle className="text-primary">{subject.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{subject.description || "No description available"}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <h3 className="text-xl font-semibold mb-2">No Subjects Found</h3>
            <p className="text-muted-foreground">There are no subjects available for this class.</p>
          </div>
        )}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader className="animate-spin h-8 w-8 text-primary" />
        <span className="ml-2 text-primary">Loading classes...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <h3 className="text-xl font-semibold mb-2 text-red-600">Error</h3>
        <p className="text-muted-foreground">{error}</p>
      </div>
    );
  }

  return (
    <div className="relative">
      {selectedClass ? (
        <SubjectsView />
      ) : (
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "EN" | "FR")} className="w-full">
          <TabsList className="grid grid-cols-2 mb-4 bg-card/95 backdrop-blur border border-primary/20">
            {Object.keys(classesGroupedBySection).map((section) => (
              <TabsTrigger key={section} value={section} className="data-[state=active]:bg-primary data-[state=active]:text-white">
                {section}
              </TabsTrigger>
            ))}
          </TabsList>

          {Object.entries(classesGroupedBySection).map(([section, groups]) => (
            <TabsContent key={section} value={section}>
              {Object.keys(groups).length > 0 ? (
                renderGroups(groups)
              ) : (
                <div className="text-center py-12">
                  <h3 className="text-xl font-semibold mb-2">No Classes Found</h3>
                  <p className="text-muted-foreground">There are no classes available for this section.</p>
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      )}
    </div>
  );
};

export default ResourceBrowser;
