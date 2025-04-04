"use client";

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, Users, ExternalLink, Trash2, Copy } from "lucide-react";
import { OnlineCourseType } from "@/types";
import { format } from "date-fns";
import { useI18n } from "@/locales/client";
import Link from "next/link";
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
import { useState } from "react";
import { deleteOnlineCourse } from "@/actions/online-courses";
import { toast } from "sonner";

interface OnlineMeetingCardProps {
  course: OnlineCourseType;
  isPast?: boolean;
  onRefresh: () => void;
}

export default function OnlineMeetingCard({ course, isPast = false, onRefresh }: OnlineMeetingCardProps) {
  const t = useI18n();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await deleteOnlineCourse(course.id.toString());
      toast.success(t("onlineMeetings.details.deleteSuccess"));
      onRefresh();
    } catch (error) {
      toast.error(t("onlineMeetings.details.deleteError"));
    } finally {
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
    }
  };

  const handleCopyLink = () => {
    if (course.meeting_link) {
      navigator.clipboard.writeText(course.meeting_link);
      toast.success(t("onlineMeetings.details.copied"));
    }
  };

  const getStatusBadge = () => {
    switch (course.status) {
      case "SCHEDULED":
        return <Badge variant="outline">{t("onlineMeetings.status.scheduled")}</Badge>;
      case "ONGOING":
        return <Badge variant="default" className="bg-green-500">{t("onlineMeetings.status.ongoing")}</Badge>;
      case "COMPLETED":
        return <Badge variant="secondary">{t("onlineMeetings.status.completed")}</Badge>;
      case "CANCELLED":
        return <Badge variant="destructive">{t("onlineMeetings.status.cancelled")}</Badge>;
      default:
        return null;
    }
  };

  return (
    <>
      <Card className="h-full flex flex-col">
        <CardHeader>
          <div className="flex justify-between items-start">
            <CardTitle className="text-lg">{course.title}</CardTitle>
            {getStatusBadge()}
          </div>
        </CardHeader>
        <CardContent className="flex-grow">
          <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
            {course.description || "No description provided"}
          </p>
          
          <div className="space-y-3">
            <div className="flex items-center text-sm">
              <Calendar className="w-4 h-4 mr-2 text-muted-foreground" />
              <span>{format(new Date(course.start_time), "PPP")}</span>
            </div>
            
            <div className="flex items-center text-sm">
              <Clock className="w-4 h-4 mr-2 text-muted-foreground" />
              <span>
                {format(new Date(course.start_time), "p")} • {course.duration_minutes} {t("onlineMeetings.duration.minutes")}
              </span>
            </div>
            
            <div className="flex items-center text-sm">
              <Users className="w-4 h-4 mr-2 text-muted-foreground" />
              <span>{course.attendees?.length || 0} attendees</span>
            </div>
          </div>
        </CardContent>
        <CardFooter className="border-t pt-4 flex flex-col gap-2">
          <div className="flex w-full justify-between gap-2">
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => setIsDeleteDialogOpen(true)}
            >
              <Trash2 className="w-4 h-4 mr-1" />
              {t("common.delete")}
            </Button>
            
            <Button
              asChild
              variant="default"
              size="sm"
              className="w-full"
            >
              <Link href={`/dashboard/online-meetings/${course.id}`}>
                {t("onlineMeetings.details.view")}
              </Link>
            </Button>
          </div>
          
          {course.meeting_link && !isPast && (
            <div className="w-full flex gap-2 mt-1">
              <Button 
                variant="outline" 
                size="sm" 
                className="w-1/2"
                onClick={handleCopyLink}
              >
                <Copy className="w-4 h-4 mr-1" />
                {t("onlineMeetings.details.copy")}
              </Button>
              
              <Button
                asChild
                variant="default"
                size="sm"
                className="w-1/2 bg-green-600 hover:bg-green-700"
              >
                <a href={course.meeting_link} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="w-4 h-4 mr-1" />
                  {t("onlineMeetings.details.join")}
                </a>
              </Button>
            </div>
          )}
        </CardFooter>
      </Card>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("onlineMeetings.details.deleteMeeting")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("onlineMeetings.details.deleteConfirm")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>{t("common.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleDelete();
              }}
              className="bg-red-600 hover:bg-red-700"
              disabled={isDeleting}
            >
              {isDeleting ? t("common.loading") : t("common.delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
