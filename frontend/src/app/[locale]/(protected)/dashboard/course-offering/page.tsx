"use client";

import {
  listCourseOfferings,
} from "@/actions/course-offerings";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { Eye, Loader2, Plus } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";

export default function CourseOfferingPage() {
  const t = useI18n();
  const [offerings, setOfferings] =
    useState<PaginationType<CourseOfferingType> | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadOfferings = useCallback(async () => {
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
  }, [t]);

  useEffect(() => {
    loadOfferings();
  }, [loadOfferings]);

  return (
    <div className="container px-4 py-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {t("courseOfferings.title")}
          </h1>
          <p className="text-muted-foreground">
            {t("courseOfferings.description")}
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/course-offering/create">
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
              <span className="ml-2 text-lg">
                {t("courseOfferings.loading")}
              </span>
            </div>
          ) : error ? (
            <div className="flex flex-col justify-center items-center h-40 space-y-4">
              <p className="text-destructive">{error}</p>
              <Button onClick={loadOfferings}>
                {t("courseOfferings.retry")}
              </Button>
            </div>
          ) : !offerings?.results?.length ? (
            <div className="flex justify-center items-center h-40">
              <p className="text-muted-foreground">
                {t("courseOfferings.noOfferings")}
              </p>
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
                    <TableHead className="text-right">
                      {t("courseOfferings.actions")}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {offerings.results.map((offering) => (
                    <TableRow key={offering.id}>
                      <TableCell className="font-medium">
                        {offering.subject.name}
                      </TableCell>
                      <TableCell>{offering.class_level.name}</TableCell>
                      <TableCell>
                        {formatCurrency(offering.hourly_rate)}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            offering.is_available ? "default" : "secondary"
                          }
                        >
                          {offering.is_available
                            ? t("courseOfferings.available")
                            : t("courseOfferings.unavailable")}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button variant="outline" size="sm" asChild>
                          <Link
                            href={`/dashboard/course-offering/${offering.id}`}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            {t("courseOfferings.view")}
                          </Link>
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

    </div>
  );
}
