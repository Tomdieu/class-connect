"use client";

import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, Users, ExternalLink, Trash2, Copy, BookOpen, FileText } from "lucide-react";
import { OnlineCourseType } from "@/types";
import { format } from "date-fns";
import { useCurrentLocale, useI18n } from "@/locales/client";
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
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/utils"; // Assuming you have this utility

interface OnlineMeetingCardProps {
  course: OnlineCourseType;
  isPast?: boolean;
  onRefresh: () => void;
}

export default function OnlineMeetingCard({ course, isPast = false, onRefresh }: OnlineMeetingCardProps) {
  const t = useI18n();
  const locale = useCurrentLocale();
  const queryClient = useQueryClient();
  
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Set up delete mutation with React Query
  const deleteMutation = useMutation({
    mutationFn: (courseId: string) => deleteOnlineCourse(courseId),
    onSuccess: () => {
      // Invalidate and refetch relevant queries
      queryClient.invalidateQueries({ queryKey: ['onlineCourses'] });
      toast.success(t("onlineMeetings.details.deleteSuccess"));
      onRefresh();
      setIsDeleteDialogOpen(false);
    },
    onError: (error) => {
      console.error("Delete error:", error);
      toast.error(t("onlineMeetings.details.deleteError"));
    }
  });

  const handleDelete = () => {
    deleteMutation.mutate(course.id.toString());
  };

  const handleCopyLink = () => {
    if (course?.code) {
      const baseUrl = window.location.origin;
      const meetingUrl = `${baseUrl}/${locale}/meet/${course.code}`;
      
      navigator.clipboard.writeText(meetingUrl);
      toast.success(t("onlineMeetings.details.copied"));
    }
  };

  const getLink = () => {
    const baseUrl = window.location.origin;
    const meetingUrl = `${baseUrl}/${locale}/meet/${course.code}`;
    return meetingUrl;
  };

  const getStatusBadge = () => {
    switch (course.status) {
      case "SCHEDULED":
        return (
          <Badge variant="outline" className="font-medium">
            {t("onlineMeetings.status.scheduled")}
          </Badge>
        );
      case "ONGOING":
        return (
          <Badge variant="default" className="bg-emerald-500 hover:bg-emerald-600 font-medium">
            {t("onlineMeetings.status.ongoing")}
          </Badge>
        );
      case "COMPLETED":
        return (
          <Badge variant="secondary" className="font-medium">
            {t("onlineMeetings.status.completed")}
          </Badge>
        );
      case "CANCELLED":
        return (
          <Badge variant="destructive" className="font-medium">
            {t("onlineMeetings.status.cancelled")}
          </Badge>
        );
      default:
        return null;
    }
  };

  // Get course subject icon (mocked - in a real app, you might have a subject field)
  const getCourseIcon = () => {
    // You could use a mapping from course.subject to appropriate icons
    // This is just a placeholder assuming all are generic courses
    return <BookOpen className="w-5 h-5" />;
  };

  const getFormattedDate = () => {
    const dateObj = new Date(course.start_time);
    const today = new Date();
    
    const isToday = dateObj.toDateString() === today.toDateString();
    const isTomorrow = new Date(today.setDate(today.getDate() + 1)).toDateString() === dateObj.toDateString();
    
    if (isToday) return `Today, ${format(dateObj, "p")}`;
    if (isTomorrow) return `Tomorrow, ${format(dateObj, "p")}`;
    return format(dateObj, "PPP, p");
  };

  const isStartingSoon = () => {
    const now = new Date();
    const startTime = new Date(course.start_time);
    const diffMs = startTime.getTime() - now.getTime();
    const diffMinutes = Math.floor(diffMs / 60000);
    
    return diffMinutes >= 0 && diffMinutes <= 30 && course.status !== "COMPLETED";
  };

  return (
    <>
      <Card className={cn(
        "h-full flex flex-col overflow-hidden transition-all duration-200 hover:shadow-md",
        isStartingSoon() && "border-emerald-400 shadow-md",
        course.status === "ONGOING" && "border-emerald-500 shadow-md"
      )}>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex gap-3 items-center">
              <div className={cn(
                "p-2 rounded-full w-10 h-10 flex items-center justify-center",
                course.status === "ONGOING" ? "bg-emerald-100 text-emerald-600" : "bg-blue-50 text-blue-600"
              )}>
                {getCourseIcon()}
              </div>
              <div>
                <h3 className="font-semibold text-lg line-clamp-1">{course.title}</h3>
                <div className="flex items-center mt-1">
                  {getStatusBadge()}
                  {isStartingSoon() && !isPast && course.status !== "CANCELLED" && (
                    <Badge variant="outline" className="ml-2 bg-amber-100 text-amber-700 border-amber-200">
                      Starting soon
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="py-3 flex-grow">
          {course.description && (
            <div className="flex gap-2 mb-4 text-sm">
              <FileText className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
              <p className="text-muted-foreground line-clamp-2">
                {course.description || "No description provided"}
              </p>
            </div>
          )}
          
          <div className="space-y-3 mt-3">
            <div className="flex items-center text-sm">
              <Calendar className="w-4 h-4 mr-2 text-blue-500 flex-shrink-0" />
              <span>{getFormattedDate()}</span>
            </div>
            
            <div className="flex items-center text-sm">
              <Clock className="w-4 h-4 mr-2 text-blue-500 flex-shrink-0" />
              <span>{course.duration_minutes} {t("onlineMeetings.duration.minutes")}</span>
            </div>
            
            <div className="flex items-center text-sm">
              <Users className="w-4 h-4 mr-2 text-blue-500 flex-shrink-0" />
              <span>
                {course.attendees?.length || 0} 
                {course.attendees?.length === 1 ? ' attendee' : ' attendees'}
              </span>
            </div>
          </div>
        </CardContent>
        
        <CardFooter className="border-t pt-4 flex flex-col gap-2 bg-gray-50">
          <div className="flex w-full justify-between gap-2">
            <Button
              variant="outline"
              size="sm"
              className="w-full text-gray-600 hover:text-red-600 hover:border-red-200 transition-colors"
              onClick={() => setIsDeleteDialogOpen(true)}
            >
              <Trash2 className="w-4 h-4 mr-1" />
              {t("common.delete")}
            </Button>
            
            <Button
              asChild
              variant="outline"
              size="sm"
              className="w-full text-blue-600 border-blue-200 hover:bg-blue-50"
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
                className="w-1/2 border-gray-200"
                onClick={handleCopyLink}
              >
                <Copy className="w-4 h-4 mr-1" />
                {t("onlineMeetings.details.copy")}
              </Button>
              
              <Button
                asChild
                variant="default"
                size="sm"
                className={cn(
                  "w-1/2 font-medium",
                  course.status === "ONGOING" 
                    ? "bg-emerald-600 hover:bg-emerald-700" 
                    : "bg-blue-600 hover:bg-blue-700"
                )}
              >
                <a href={getLink()} target="_blank" rel="noopener noreferrer" className="flex items-center">
                  <ExternalLink className="w-4 h-4 mr-1" />
                  {course.status === "ONGOING" 
                    ? t("onlineMeetings.details.joinNow") 
                    : t("onlineMeetings.details.join")}
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
            <AlertDialogCancel disabled={deleteMutation.isPending}>{t("common.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleDelete();
              }}
              className="bg-red-600 hover:bg-red-700"
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? t("common.loading") : t("common.delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
// "use client";

// import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
// import { Badge } from "@/components/ui/badge";
// import { Button } from "@/components/ui/button";
// import { Calendar, Clock, Users, ExternalLink, Trash2, Copy } from "lucide-react";
// import { OnlineCourseType } from "@/types";
// import { format } from "date-fns";
// import { useCurrentLocale, useI18n } from "@/locales/client";
// import Link from "next/link";
// import {
//   AlertDialog,
//   AlertDialogAction,
//   AlertDialogCancel,
//   AlertDialogContent,
//   AlertDialogDescription,
//   AlertDialogFooter,
//   AlertDialogHeader,
//   AlertDialogTitle,
// } from "@/components/ui/alert-dialog";
// import { useState } from "react";
// import { deleteOnlineCourse } from "@/actions/online-courses";
// import { toast } from "sonner";

// interface OnlineMeetingCardProps {
//   course: OnlineCourseType;
//   isPast?: boolean;
//   onRefresh: () => void;
// }

// export default function OnlineMeetingCard({ course, isPast = false, onRefresh }: OnlineMeetingCardProps) {
//   const t = useI18n();
//     const locale = useCurrentLocale()
  
//   const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
//   const [isDeleting, setIsDeleting] = useState(false);

//   const handleDelete = async () => {
//     try {
//       setIsDeleting(true);
//       await deleteOnlineCourse(course.id.toString());
//       toast.success(t("onlineMeetings.details.deleteSuccess"));
//       onRefresh();
//     } catch (error) {
//       toast.error(t("onlineMeetings.details.deleteError"));
//     } finally {
//       setIsDeleting(false);
//       setIsDeleteDialogOpen(false);
//     }
//   };

//   // const handleCopyLink = () => {
//   //   if (course.meeting_link) {
//   //     navigator.clipboard.writeText(course.meeting_link);
//   //     toast.success(t("onlineMeetings.details.copied"));
//   //   }
//   // };

//   const handleCopyLink = () => {
//       if (course?.code) {
//         // Construct the full meeting URL
//         const baseUrl = window.location.origin;
//         const meetingUrl = `${baseUrl}/${locale}/meet/${course.code}`;
  
//         navigator.clipboard.writeText(meetingUrl);
//         toast.success(t("onlineMeetings.details.copied"));
//       }
//     };

//     const getLink = ()=>{
//       const baseUrl = window.location.origin;
//         const meetingUrl = `${baseUrl}/${locale}/meet/${course.code}`;
//         return meetingUrl
//     }

//   const getStatusBadge = () => {
//     switch (course.status) {
//       case "SCHEDULED":
//         return <Badge variant="outline">{t("onlineMeetings.status.scheduled")}</Badge>;
//       case "ONGOING":
//         return <Badge variant="default" className="bg-green-500">{t("onlineMeetings.status.ongoing")}</Badge>;
//       case "COMPLETED":
//         return <Badge variant="secondary">{t("onlineMeetings.status.completed")}</Badge>;
//       case "CANCELLED":
//         return <Badge variant="destructive">{t("onlineMeetings.status.cancelled")}</Badge>;
//       default:
//         return null;
//     }
//   };

//   return (
//     <>
//       <Card className="h-full flex flex-col">
//         <CardHeader>
//           <div className="flex justify-between items-start">
//             <CardTitle className="text-lg">{course.title}</CardTitle>
//             {getStatusBadge()}
//           </div>
//         </CardHeader>
//         <CardContent className="flex-grow">
//           <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
//             {course.description || "No description provided"}
//           </p>
          
//           <div className="space-y-3">
//             <div className="flex items-center text-sm">
//               <Calendar className="w-4 h-4 mr-2 text-muted-foreground" />
//               <span>{format(new Date(course.start_time), "PPP")}</span>
//             </div>
            
//             <div className="flex items-center text-sm">
//               <Clock className="w-4 h-4 mr-2 text-muted-foreground" />
//               <span>
//                 {format(new Date(course.start_time), "p")} • {course.duration_minutes} {t("onlineMeetings.duration.minutes")}
//               </span>
//             </div>
            
//             <div className="flex items-center text-sm">
//               <Users className="w-4 h-4 mr-2 text-muted-foreground" />
//               <span>{course.attendees?.length || 0} attendees</span>
//             </div>
//           </div>
//         </CardContent>
//         <CardFooter className="border-t pt-4 flex flex-col gap-2">
//           <div className="flex w-full justify-between gap-2">
//             <Button
//               variant="outline"
//               size="sm"
//               className="w-full"
//               onClick={() => setIsDeleteDialogOpen(true)}
//             >
//               <Trash2 className="w-4 h-4 mr-1" />
//               {t("common.delete")}
//             </Button>
            
//             <Button
//               asChild
//               variant="default"
//               size="sm"
//               className="w-full"
//             >
//               <Link href={`/dashboard/online-meetings/${course.id}`}>
//                 {t("onlineMeetings.details.view")}
//               </Link>
//             </Button>
//           </div>
          
//           {course.meeting_link && !isPast && (
//             <div className="w-full flex gap-2 mt-1">
//               <Button 
//                 variant="outline" 
//                 size="sm" 
//                 className="w-1/2"
//                 onClick={handleCopyLink}
//               >
//                 <Copy className="w-4 h-4 mr-1" />
//                 {t("onlineMeetings.details.copy")}
//               </Button>
              
//               <Button
//                 asChild
//                 variant="default"
//                 size="sm"
//                 className="w-1/2 bg-green-600 hover:bg-green-700"
//               >
//                 <a href={getLink()} target="_blank" rel="noopener noreferrer">
//                   <ExternalLink className="w-4 h-4 mr-1" />
//                   {t("onlineMeetings.details.join")}
//                 </a>
//               </Button>
//             </div>
//           )}
//         </CardFooter>
//       </Card>

//       <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
//         <AlertDialogContent>
//           <AlertDialogHeader>
//             <AlertDialogTitle>{t("onlineMeetings.details.deleteMeeting")}</AlertDialogTitle>
//             <AlertDialogDescription>
//               {t("onlineMeetings.details.deleteConfirm")}
//             </AlertDialogDescription>
//           </AlertDialogHeader>
//           <AlertDialogFooter>
//             <AlertDialogCancel disabled={isDeleting}>{t("common.cancel")}</AlertDialogCancel>
//             <AlertDialogAction
//               onClick={(e) => {
//                 e.preventDefault();
//                 handleDelete();
//               }}
//               className="bg-red-600 hover:bg-red-700"
//               disabled={isDeleting}
//             >
//               {isDeleting ? t("common.loading") : t("common.delete")}
//             </AlertDialogAction>
//           </AlertDialogFooter>
//         </AlertDialogContent>
//       </AlertDialog>
//     </>
//   );
// }
