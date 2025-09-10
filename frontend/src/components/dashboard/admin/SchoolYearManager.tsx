"use client";

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import toast from "react-hot-toast";
import { addSchoolYear, listSchoolYear } from '@/actions/enrollments';
import { SchoolYearType } from '@/types';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader, Plus, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { useI18n } from "@/locales/client";

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
    scale: 1.03, 
    boxShadow: "0 10px 25px rgba(0,0,0,0.08)",
    transition: { 
      type: "spring", 
      stiffness: 400, 
      damping: 15 
    }
  }
};

interface SchoolYearManagerProps {
  className?: string;
}

export function SchoolYearManager({ className = "" }: SchoolYearManagerProps) {
  const t = useI18n();
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [startYear, setStartYear] = useState<number>(new Date().getFullYear());
  const [endYear, setEndYear] = useState<number>(new Date().getFullYear() + 1);

  const { data: schoolYears, isLoading, isError, error } = useQuery<SchoolYearType[]>({
    queryKey: ['school-years'],
    queryFn: listSchoolYear,
  });

  const addSchoolYearMutation = useMutation({
    mutationFn: addSchoolYear,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['school-years'] });
      toast.success(
        t('schoolYear.addSuccess') || `School year ${startYear}-${endYear} added successfully`
      );
      setIsOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      let errorMessage = "Failed to add school year";
      try {
        const errorObj = JSON.parse(error.message);
        errorMessage = errorObj.message || errorMessage;
      } catch (e) {
        // Use the original error message
      }
      toast.error(errorMessage);
    }
  });

  const resetForm = () => {
    const currentYear = new Date().getFullYear();
    setStartYear(currentYear);
    setEndYear(currentYear + 1);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addSchoolYearMutation.mutate({
      start_year: startYear.toString(),
      end_year: endYear.toString()
    });
  };

  if (isLoading) {
    return (
      <div className={`flex justify-center items-center p-6 ${className}`}>
        <Loader className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className={`bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg ${className}`}>
        <p className="font-medium">Error loading school years</p>
        <p className="text-sm">{(error as Error).message}</p>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 flex items-center">
            <Calendar className="mr-2 h-5 w-5 text-primary" />
            {t('schoolYear.title') || "School Years"}
          </h3>
          <p className="text-sm text-gray-600">{t('schoolYear.subtitle') || "Manage academic years"}</p>
        </div>
        
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="bg-primary hover:bg-primary/90">
              <Plus size={16} className="mr-1" />
              {t('schoolYear.add') || "Add Year"}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>{t('schoolYear.addTitle') || "Add New School Year"}</DialogTitle>
              <DialogDescription>
                {t('schoolYear.addDescription') || "Create a new academic year period."}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="start-year">{t('schoolYear.startYear') || "Start Year"}</Label>
                  <Input
                    id="start-year"
                    type="number"
                    value={startYear}
                    onChange={(e) => setStartYear(parseInt(e.target.value))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end-year">{t('schoolYear.endYear') || "End Year"}</Label>
                  <Input
                    id="end-year"
                    type="number"
                    value={endYear}
                    onChange={(e) => setEndYear(parseInt(e.target.value))}
                    required
                  />
                </div>
              </div>
              <DialogFooter>
                <Button 
                  type="submit" 
                  disabled={addSchoolYearMutation.isPending || startYear >= endYear}
                  className="bg-primary hover:bg-primary/90"
                >
                  {addSchoolYearMutation.isPending ? (
                    <Loader className="h-4 w-4 animate-spin mr-2" />
                  ) : null}
                  {t('schoolYear.create') || "Create"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
        {schoolYears && schoolYears.length > 0 ? (
          schoolYears.map((year) => (
            <motion.div
              key={year.id}
              variants={cardVariants}
              initial="hidden"
              animate="show"
              whileHover="hover"
              className="bg-white rounded-lg p-4 border border-gray-100 shadow-sm flex flex-col justify-between"
            >
              <div>
                <h4 className="text-lg font-semibold text-gray-800">{year.formatted_year}</h4>
                <p className="text-sm text-gray-500 mt-1">ID: {year.id}</p>
              </div>
              <div className="flex justify-between items-center mt-4">
                <Badge variant={year.is_active ? "success" : "outline"} className={year.is_active ? "bg-green-100 text-green-800 hover:bg-green-200" : ""}>
                  {year.is_active ? (t('schoolYear.active') || "Active") : (t('schoolYear.inactive') || "Inactive")}
                </Badge>
                <span className="text-xs text-gray-500">
                  {year.start_year} - {year.end_year}
                </span>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="col-span-full flex flex-col items-center justify-center p-8 bg-gray-50 rounded-lg border border-dashed border-gray-200">
            <Calendar className="h-12 w-12 text-gray-400 mb-2" />
            <h4 className="text-lg font-medium text-gray-700 mb-1">{t('schoolYear.empty') || "No School Years Found"}</h4>
            <p className="text-sm text-gray-500 text-center mb-4">
              {t('schoolYear.emptyDescription') || "Add your first academic year to get started"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
