"use client";

import { deleteCourseOffering, listCourseOfferings } from "@/actions/course-offerings";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useI18n } from "@/locales/client";
import { CourseOfferingType, PaginationType } from "@/types";
import { Edit, Eye, Loader2, Plus, Trash } from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { BookOpen, Clock, Target, Trophy } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.2 } },
};

const sectionVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export default function CourseOfferingPage() {
  const t = useI18n();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
  const [offeringToDelete, setOfferingToDelete] = useState<number | null>(null);
  const queryClient = useQueryClient();

  // Using TanStack Query to fetch course offerings
  const { 
    data: offerings,
    isLoading,
    isError,
    error,
    refetch,
    isRefetching
  } = useQuery({
    queryKey: ['courseOfferings'],
    queryFn: ()=>listCourseOfferings(),
    refetchInterval: 10000, // Refetch data every 10 seconds
    refetchOnWindowFocus: false,
    staleTime: 10000, // Consider data fresh for 10 seconds
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteCourseOffering(id),
    onSuccess: () => {
      toast.success(t("courseOfferings.success.deleted"));
      queryClient.invalidateQueries({ queryKey: ['courseOfferings'] });
      setDeleteDialogOpen(false);
      setOfferingToDelete(null);
    },
    onError: (err) => {
      console.error(err);
      toast.error(t("courseOfferings.error.deleted"));
      setDeleteDialogOpen(false);
      setOfferingToDelete(null);
    }
  });

  const handleDeleteClick = (id: number) => {
    setOfferingToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!offeringToDelete) return;
    deleteMutation.mutate(offeringToDelete);
  };

  const renderEmptyState = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center justify-center space-y-8 p-8 text-center"
    >
      <div className="relative">
        <div className="absolute -top-8 -right-8 w-16 h-16 bg-primary/10 rounded-full animate-pulse" />
        <div className="absolute -bottom-4 -left-4 w-12 h-12 bg-primary/20 rounded-full animate-pulse delay-100" />
        <div className="bg-primary/10 p-4 rounded-full relative z-10">
          <BookOpen className="h-12 w-12 text-primary" />
        </div>
      </div>

      <div className="space-y-3 max-w-lg">
        <h3 className="text-2xl font-bold text-gray-800">
          {t("courseOfferings.noOfferings")}
        </h3>
        <p className="text-gray-600">
          {t("courseOfferings.emptyStateDescription")}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl">
        {[
          {
            icon: <Clock className="h-6 w-6 text-primary" />,
            title: t("courseOfferings.benefits.flexibility"),
            description: t("courseOfferings.benefits.flexibilityDesc")
          },
          {
            icon: <Target className="h-6 w-6 text-primary" />,
            title: t("courseOfferings.benefits.targeting"),
            description: t("courseOfferings.benefits.targetingDesc")
          },
          {
            icon: <Trophy className="h-6 w-6 text-primary" />,
            title: t("courseOfferings.benefits.earnings"),
            description: t("courseOfferings.benefits.earningsDesc")
          }
        ].map((benefit, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 + 0.5 }}
            className="bg-white/50 backdrop-blur-sm p-6 rounded-xl border border-primary/10 hover:shadow-lg transition-shadow"
          >
            <div className="bg-primary/10 p-3 rounded-full w-fit mb-4">
              {benefit.icon}
            </div>
            <h4 className="font-semibold text-gray-800 mb-2">{benefit.title}</h4>
            <p className="text-sm text-gray-600">{benefit.description}</p>
          </motion.div>
        ))}
      </div>

      <div className="space-y-4">
        <Button
          size="lg"
          className="bg-primary hover:bg-primary/90 text-white"
          asChild
        >
          <Link href="/admin/course-offerings/create">
            <Plus className="mr-2 h-5 w-5" />
            {t("courseOfferings.createFirst")}
          </Link>
        </Button>
        <p className="text-sm text-gray-500">
          {t("courseOfferings.getStartedGuide"  )}
        </p>
      </div>
    </motion.div>
  );

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
              {t("courseOfferings.title")}
            </h1>
            <p className="text-sm text-gray-600">{t("courseOfferings.description")}</p>
          </div>
        </div>

        <Button
          className="bg-primary hover:bg-primary/90 text-white flex items-center gap-2 shadow-md hover:shadow-lg transition-shadow rounded-lg px-6 py-6 relative z-10"
          size="lg"
          asChild
        >
          <Link href="/admin/course-offerings/create">
            <Plus size={20} />
            {t("courseOfferings.add")}
          </Link>
        </Button>
      </motion.div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="space-y-10 max-w-[2400px] mx-auto"
      >
        <motion.div
          variants={sectionVariants}
          className="bg-white/90 backdrop-blur-sm rounded-xl px-4 py-6 shadow-md hover:shadow-lg transition-shadow duration-300 border border-primary/10 relative overflow-hidden"
        >
          {isLoading && !isRefetching ? (
            <div className="flex justify-center items-center h-40">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2 text-lg">{t("courseOfferings.loading")}</span>
            </div>
          ) : isError ? (
            <div className="flex flex-col justify-center items-center h-40 space-y-4">
              <p className="text-destructive">{t("courseOfferings.error")}</p>
              <Button onClick={() => refetch()}>{t("courseOfferings.retry")}</Button>
            </div>
          ) : !offerings?.results?.length ? (
            renderEmptyState()
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("courseOfferings.subject")}</TableHead>
                    <TableHead>{t("courseOfferings.class")}</TableHead>
                    <TableHead>{t("courseOfferings.hourlyRate")}</TableHead>
                    <TableHead>{t("courseOfferings.status")}</TableHead>
                    <TableHead className="text-right">{t("courseOfferings.actions")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {offerings.results.map((offering) => (
                    <TableRow key={offering.id}>
                      <TableCell className="font-medium">{offering.subject.name}</TableCell>
                      <TableCell>{offering.class_level.definition_display}</TableCell>
                      <TableCell>{formatCurrency(offering.hourly_rate)}</TableCell>
                      <TableCell>
                        <Badge 
                          variant={offering.is_available ? "default" : "secondary"}
                        >
                          {offering.is_available 
                            ? t("courseOfferings.available") 
                            : t("courseOfferings.unavailable")}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/admin/course-offerings/${offering.id}`}>
                            <Eye className="h-4 w-4 mr-1" />
                            {t("courseOfferings.view")}
                          </Link>
                        </Button>
                        {offering.is_available && (
                          <>
                            <Button variant="outline" size="sm" asChild>
                              <Link href={`/admin/course-offerings/${offering.id}/edit`}>
                                <Edit className="h-4 w-4 mr-1" />
                                {t("courseOfferings.edit")}
                              </Link>
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => handleDeleteClick(offering.id)}
                            >
                              <Trash className="h-4 w-4 mr-1" />
                              {t("courseOfferings.delete")}
                            </Button>
                          </>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </motion.div>
      </motion.div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("courseOfferings.confirm.delete")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("courseOfferings.confirm.deleteDescription")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.isPending}>
              {t("courseOfferings.confirm.cancel")}
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={(e) => {
                e.preventDefault();
                handleDelete();
              }}
              disabled={deleteMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              {t("courseOfferings.confirm.confirm")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  );
}