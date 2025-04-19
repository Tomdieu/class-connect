"use client";
import { getformatedClasses } from "@/actions/courses";
import { SchoolStructure, Section } from "@/types";
import { useQuery } from "@tanstack/react-query";
import { ChevronDown, ChevronRight, Loader, Plus, Book, GraduationCap, School, Users, BookOpen, BarChart3 } from "lucide-react";
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
        className="w-full flex justify-center items-center h-screen"
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
        className="w-full flex justify-center items-center h-screen"
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
        className="p-5 h-[160px] rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 bg-white/80 backdrop-blur-sm border border-gray-200 flex flex-col justify-between relative overflow-hidden"
      >
        {/* Status indicator */}
        <div className={`absolute top-0 right-0 w-[80px] h-[80px] rounded-bl-full z-0 opacity-20 
          ${c.status === 'active' ? 'bg-emerald-500' : 
            c.status === 'draft' ? 'bg-amber-500' : 'bg-gray-500'}`}>
        </div>
        
        {/* Status badge */}
        <div className="absolute top-3 right-3 z-10">
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full
            ${c.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 
              c.status === 'draft' ? 'bg-amber-100 text-amber-800' : 'bg-gray-100 text-gray-800'}`}>
            {c.status === 'active' ? t('class.status.active') : 
              c.status === 'draft' ? t('class.status.draft') : t('class.status.archived')}
          </span>
        </div>
        
        <div>
          <h4 className="text-xl font-semibold mb-2 text-gray-800">{c.name}</h4>
          <p className="text-sm text-gray-600 line-clamp-2 mb-3">
            {c.description && <>{c.description || t("class.noDescription")}</>}
          </p>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-xs font-medium px-2 py-1 bg-primary/10 text-primary rounded-full">
            {t(`sections.${section}`)}
          </span>
          <span className="text-xs text-gray-500 flex items-center">
            <Users size={12} className="mr-1" />
            {c.student_count} {c.student_count === 1 ? t("class.student") : t("class.students")}
          </span>
        </div>
      </motion.div>
    </Link>
  );

  const renderLevelSection = (title: string, classes: any[], section: Section, sectionId: string, icon?: React.ReactNode) => {
    const isOpen = openSections[sectionId];
    
    if (classes.length === 0) {
      // Empty state
      return (
        <Collapsible
          key={sectionId}
          open={openSections[sectionId]}
          onOpenChange={() => toggleSection(sectionId)}
          className="space-y-2"
        >
          <CollapsibleTrigger className="flex items-center w-full gap-2 p-4 rounded-lg bg-gradient-to-r from-primary/5 to-primary/10 hover:from-primary/10 hover:to-primary/20 transition-colors shadow-sm">
            <motion.div
              animate={{ rotate: openSections[sectionId] ? 90 : 0 }}
              transition={{ type: "spring", stiffness: 200 }}
            >
              <ChevronRight className="h-5 w-5 text-primary/70" />
            </motion.div>
            {icon && <div className="text-primary">{icon}</div>}
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            <span className="text-sm text-primary/70 ml-2 bg-primary/10 px-2 py-0.5 rounded-full">
              0 {t("class.plural")}
            </span>
          </CollapsibleTrigger>
          
          <AnimatePresence>
            {isOpen && (
              <CollapsibleContent>
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="p-8 flex flex-col items-center justify-center text-center rounded-lg border border-dashed border-primary/30 bg-primary/5 mt-3"
                >
                  <div className="bg-primary/10 p-3 rounded-full mb-3">
                    <BookOpen className="h-8 w-8 text-primary" />
                  </div>
                  <h4 className="text-lg font-medium text-gray-800 mb-2">{t('class.empty.title')}</h4>
                  <p className="text-sm text-gray-600 mb-4 max-w-md">{t('class.empty.description')}</p>
                  <Button 
                    onClick={onAdd} 
                    className="bg-primary hover:bg-primary/90 text-white flex items-center gap-2"
                  >
                    <Plus size={18} />
                    {t("class.actions.add")}
                  </Button>
                </motion.div>
              </CollapsibleContent>
            )}
          </AnimatePresence>
        </Collapsible>
      );
    }
    
    // Calculate metrics for the section
    const totalStudents = classes.reduce((sum, c) => sum + c.student_count, 0);
    const avgCompletionRate = Math.round(classes.reduce((sum, c) => sum + (c.completion_rate || 0), 0) / classes.length);
    const activeClasses = classes.filter(c => c.status === 'active').length;
    
    return (
      <Collapsible
        key={sectionId}
        open={openSections[sectionId]}
        onOpenChange={() => toggleSection(sectionId)}
        className="space-y-2"
      >
        <CollapsibleTrigger className="flex items-center w-full gap-2 p-4 rounded-lg bg-gradient-to-r from-primary/5 to-primary/10 hover:from-primary/10 hover:to-primary/20 transition-colors shadow-sm">
          <motion.div
            animate={{ rotate: openSections[sectionId] ? 90 : 0 }}
            transition={{ type: "spring", stiffness: 200 }}
          >
            <ChevronRight className="h-5 w-5 text-primary/70" />
          </motion.div>
          {icon && <div className="text-primary">{icon}</div>}
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <span className="text-sm text-primary/70 ml-2 bg-primary/10 px-2 py-0.5 rounded-full">
            {classes.length} {classes.length === 1 ? t("class.singular") : t("class.plural")}
          </span>
          
          <div className="ml-auto flex gap-4 text-xs">
            {/* <span className="flex items-center bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
              <span className="w-2 h-2 bg-emerald-500 rounded-full mr-1.5"></span>
              {activeClasses} {t('class.status.active')}
            </span> */}
            
            {/* <span className="flex items-center bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
              <span className="w-2 h-2 bg-amber-500 rounded-full mr-1.5"></span>
              {classes.length - activeClasses} {classes.length - activeClasses > 0 ? t('class.status.nonActive') : ''}
            </span> */}
          </div>
        </CollapsibleTrigger>
        
        <AnimatePresence>
          {isOpen && (
            <CollapsibleContent>
              {/* Quick-view metrics */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-3 mb-5 pl-6 pr-6"
              >
                <div className="flex items-center bg-white rounded-lg p-3 shadow-sm border border-gray-100">
                  <div className="bg-primary/10 p-2 rounded-full mr-3">
                    <Users size={18} className="text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">{t('class.metrics.students')}</p>
                    <p className="text-xl font-semibold">{totalStudents}</p>
                  </div>
                </div>
                
                <div className="flex items-center bg-white rounded-lg p-3 shadow-sm border border-gray-100">
                  <div className="bg-emerald-100 p-2 rounded-full mr-3">
                    <BookOpen size={18} className="text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">{t('class.metrics.classes')}</p>
                    <p className="text-xl font-semibold">{classes.length}</p>
                  </div>
                </div>
                
                {/* <div className="flex items-center bg-white rounded-lg p-3 shadow-sm border border-gray-100">
                  <div className="bg-amber-100 p-2 rounded-full mr-3">
                    <BarChart3 size={18} className="text-amber-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">{t('class.metrics.completion')}</p>
                    <p className="text-xl font-semibold">{avgCompletionRate || 0}%</p>
                  </div>
                </div> */}
              </motion.div>

              <motion.div
                initial="hidden"
                animate="show"
                variants={containerVariants}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-5 pt-2 pl-6 pr-6"
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
          `${section}-college`,
          <School size={20} />
        )}

        {/* Lycee Sections */}
        {Object.entries(structure[section].LYCEE).map(([speciality, classes]) => (
          <React.Fragment key={`${section}-lycee-${speciality}`}>
            {renderLevelSection(
              `${t("educationLevels.lycee")} - ${speciality}`,
              classes,
              section,
              `${section}-lycee-${speciality}`,
              <Book size={20} />
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
              `${section}-university-${level}`,
              <GraduationCap size={20} />
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
      className="w-full px-4 sm:px-8 py-10 bg-gradient-to-b from-primary/5 via-background to-background min-h-screen"
    >
      <motion.div 
        className="relative flex flex-col sm:flex-row items-center justify-between mb-10 pb-4 border-b border-primary/10 max-w-[2400px] mx-auto"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <div className="absolute top-0 right-0 w-[150px] h-[150px] bg-primary/10 rounded-bl-full z-0 opacity-20"></div>
        <div className="absolute bottom-0 left-0 w-[100px] h-[100px] bg-primary/10 rounded-tr-full z-0 opacity-10"></div>
        
        <div className="flex items-center mb-4 sm:mb-0 relative z-10">
          <div className="bg-primary/10 p-3 rounded-full mr-4">
            <BookOpen className="h-7 w-7 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
              {t("class.title")}
            </h1>
            <p className="text-sm text-gray-600">{t("class.subtitle")}</p>
          </div>
        </div>
        
        <Button 
          onClick={onAdd}
          className="bg-primary hover:bg-primary/90 text-white flex items-center gap-2 shadow-md hover:shadow-lg transition-shadow rounded-lg px-6 py-6 relative z-10"
          size="lg"
        >
          <Plus size={20} />
          {t("class.actions.add")}
        </Button>
      </motion.div>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="space-y-10 max-w-[2400px] mx-auto"
      >
        {Object.entries(data).map(([section, sectionData]) => (
          <motion.div 
            key={section} 
            variants={sectionVariants}
            className="bg-white/90 backdrop-blur-sm rounded-xl px-4 py-6 shadow-md hover:shadow-lg transition-shadow duration-300 border border-primary/10 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-[200px] h-[200px] bg-primary/5 rounded-bl-full z-0"></div>
            
            <h2 className="text-2xl font-semibold mb-6 text-gray-800 border-b pb-3 relative z-10 flex items-center">
              <span className="bg-primary/10 p-2 rounded-full mr-3">
                {section === 'ANGLOPHONE' ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                    <path d="M2 5h20" /><path d="M2 10h20" /><path d="M2 15h20" /><path d="M2 20h20" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                    <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" /><line x1="4" x2="4" y1="22" y2="15" />
                  </svg>
                )}
              </span>
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
