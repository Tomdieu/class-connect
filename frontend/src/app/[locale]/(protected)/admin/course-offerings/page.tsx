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
import { useEffect, useState } from "react";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";
import { toast } from "sonner";

export default function CourseOfferingPage() {
  const t = useI18n();
  const [offerings, setOfferings] = useState<PaginationType<CourseOfferingType> | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
  const [offeringToDelete, setOfferingToDelete] = useState<number | null>(null);
  const [deleteLoading, setDeleteLoading] = useState<boolean>(false);

  const loadOfferings = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await listCourseOfferings();
      setOfferings(data);
    } catch (err) {
      console.error(err);
      setError(t("courseOfferings.error"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOfferings();
  }, []);

  const handleDeleteClick = (id: number) => {
    setOfferingToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!offeringToDelete) return;
    
    setDeleteLoading(true);
    try {
      await deleteCourseOffering(offeringToDelete);
      toast.success(t("courseOfferings.success.deleted"));
      loadOfferings();
    } catch (err) {
      console.error(err);
      toast.error(t("courseOfferings.error.deleted"));
    } finally {
      setDeleteLoading(false);
      setDeleteDialogOpen(false);
      setOfferingToDelete(null);
    }
  };

  return (
    <div className="container px-4 py-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t("courseOfferings.title")}</h1>
          <p className="text-muted-foreground">{t("courseOfferings.description")}</p>
        </div>
        <Button asChild>
          <Link href="/admin/course-offerings/create">
            <Plus className="mr-2 h-4 w-4" />
            {t("courseOfferings.add")}
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("courseOfferings.title")}</CardTitle>
          <CardDescription>{t("courseOfferings.description")}</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center h-40">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2 text-lg">{t("courseOfferings.loading")}</span>
            </div>
          ) : error ? (
            <div className="flex flex-col justify-center items-center h-40 space-y-4">
              <p className="text-destructive">{error}</p>
              <Button onClick={loadOfferings}>{t("courseOfferings.retry")}</Button>
            </div>
          ) : !offerings?.results?.length ? (
            <div className="flex justify-center items-center h-40">
              <p className="text-muted-foreground">{t("courseOfferings.noOfferings")}</p>
            </div>
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
                      <TableCell>{offering.class_level.name}</TableCell>
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
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("courseOfferings.confirm.delete")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("courseOfferings.confirm.deleteDescription")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteLoading}>
              {t("courseOfferings.confirm.cancel")}
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={(e) => {
                e.preventDefault();
                handleDelete();
              }}
              disabled={deleteLoading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteLoading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              {t("courseOfferings.confirm.confirm")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}