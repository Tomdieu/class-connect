"use client";
import { getformatedClasses } from "@/actions/courses";
import { SchoolStructure, Section } from "@/types";
import { useQuery } from "@tanstack/react-query";
import { ChevronDown, ChevronRight, Loader, Plus } from "lucide-react";
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
import { motion, AnimatePresence } from "framer-motion";

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const sectionVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { 
    opacity: 1, 
    y: 0,
    transition: { 
      duration: 0.5, 
    } 
  },
};

const cardVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  show: { 
    opacity: 1, 
    scale: 1,
    transition: { 
      type: "spring", 
      stiffness: 100,
      damping: 10
    } 
  },
  hover: { 
    scale: 1.05, 
    boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
    transition: { 
      type: "spring", 
      stiffness: 400, 
      damping: 15 
    }
  }
};

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
      <motion.div 
        className="container flex justify-center items-center h-screen"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex flex-col items-center">
          <Loader className="animate-spin size-10 text-default mb-4" />
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-gray-600"
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
        className="container flex justify-center items-center h-screen"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div 
          className="bg-red-100 border border-red-400 text-red-700 px-5 py-4 rounded-lg shadow-md max-w-md w-full"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 100 }}
        >
          <strong className="font-bold">{t("error")}: </strong>
          <span className="block mt-1">{error.message}</span>
        </motion.div>
      </motion.div>
    );
  }

  const toggleSection = (sectionId: string) => {
    setOpenSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  const renderClassCard = (c: any, section: Section) => (
    <Link href={`/admin/classes/${c.id}/`} className="block h-full">
      <motion.div
        variants={cardVariants}
        whileHover="hover"
        className="p-5 h-[160px] rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 bg-white/80 backdrop-blur-sm border border-gray-200 flex flex-col justify-between"
      >
        <div>
          <h4 className="text-xl font-semibold mb-2 text-gray-800">{c.name}</h4>
          <p className="text-sm text-gray-600 line-clamp-2 mb-3">
            {c.description && <>{c.description || t("class.noDescription")}</>}
          </p>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-xs font-medium px-2 py-1 bg-default/10 text-default rounded-full">
            {t(`sections.${section}`)}
          </span>
          <span className="text-xs text-gray-500">
            {c.student_count} {c.student_count === 1 ? t("class.student") : t("class.students")}
          </span>
        </div>
      </motion.div>
    </Link>
  );

  const renderLevelSection = (title: string, classes: any[], section: Section, sectionId: string) => {
    if (classes.length === 0) return null;
    
    return (
      <Collapsible
        key={sectionId}
        open={openSections[sectionId]}
        onOpenChange={() => toggleSection(sectionId)}
        className="space-y-2"
      >
        <CollapsibleTrigger className="flex items-center w-full gap-2 p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
          <motion.div
            animate={{ rotate: openSections[sectionId] ? 90 : 0 }}
            transition={{ type: "spring", stiffness: 200 }}
          >
            <ChevronRight className="h-5 w-5 text-gray-600" />
          </motion.div>
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <span className="text-sm text-gray-500 ml-2 bg-gray-200/70 px-2 py-0.5 rounded-full">
            {classes.length} {classes.length === 1 ? t("class.singular") : t("class.plural")}
          </span>
        </CollapsibleTrigger>
        
        <AnimatePresence>
          {openSections[sectionId] && (
            <CollapsibleContent>
              <motion.div
                initial="hidden"
                animate="show"
                variants={containerVariants}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 pt-4 pl-6"
              >
                {classes.map(c => (
                  <motion.div key={c.id} variants={cardVariants} className="h-full">
                    {renderClassCard(c, section)}
                  </motion.div>
                ))}
              </motion.div>
            </CollapsibleContent>
          )}
        </AnimatePresence>
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
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="container px-2 sm:px-8 py-10"
    >
      <motion.div 
        className="flex items-center justify-between mb-10"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold bg-gradient-to-r from-default to-blue-600 bg-clip-text text-transparent">
          {t("class.title")}
        </h1>
        <Button 
          onClick={onAdd}
          className="bg-default hover:bg-default/90 text-white flex items-center gap-2 shadow-md hover:shadow-lg transition-shadow rounded-lg px-4"
        >
          <Plus size={18} />
          {t("class.actions.add")}
        </Button>
      </motion.div>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="space-y-10"
      >
        {Object.entries(data).map(([section, sectionData]) => (
          <motion.div 
            key={section} 
            variants={sectionVariants}
            className="bg-white rounded-xl px-4 py-6 shadow-md hover:shadow-lg transition-shadow duration-300"
          >
            <h2 className="text-2xl font-semibold mb-6 text-gray-800 border-b pb-3">
              {t(`sections.${section}`)}
            </h2>
            {renderSectionContent(data, section as Section)}
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
}

export default CoursesPages;
