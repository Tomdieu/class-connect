"use client";

import { useState } from "react";
import { useI18n } from "@/locales/client";
import { useQuery } from "@tanstack/react-query";
import { getOnlineCourseFromId, deleteOnlineCourse, addAttendeeToOnlineCourse, removeAttendeeFromOnlineCourse } from "@/actions/online-courses";
import { getUsers } from "@/actions/accounts";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";
import { UserX, VideoIcon, Clock, Calendar, Users, Copy, ExternalLink, UserPlus, Trash2, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
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
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { UserType } from "@/types";

interface OnlineMeetingDetailClientProps {
  meetingId: string;
}

export default function OnlineMeetingDetailClient({ meetingId }: OnlineMeetingDetailClientProps) {
  const t = useI18n();
  const router = useRouter();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

  // Fetch meeting details
  const { data: meeting, isLoading, error, refetch } = useQuery({
    queryKey: ["onlineCourse", meetingId],
    queryFn: () => getOnlineCourseFromId(meetingId),
  });

  // Fetch users for attendee selection
  const { data: users } = useQuery({
    queryKey: ["users"],
    queryFn: () => getUsers(),
    enabled: true,
  });

  // Filter users based on search and exclude existing attendees
  const filteredUsers = users?.filter(user => {
    const isAlreadyAttendee = meeting?.attendees.some(attendee => attendee.id === user.id);
    const matchesSearch = searchQuery.trim() === "" || 
      `${user.first_name} ${user.last_name}`.toLowerCase().includes(searchQuery.toLowerCase()) || 
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    return !isAlreadyAttendee && matchesSearch;
  }) || [];

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await deleteOnlineCourse(meetingId);
      toast.success(t("onlineMeetings.details.deleteSuccess"));
      router.push("/dashboard/online-meetings");
    } catch (error) {
      toast.error(t("onlineMeetings.details.deleteError"));
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
    }
  };

  const handleCopyLink = () => {
    if (meeting?.meeting_link) {
      navigator.clipboard.writeText(meeting.meeting_link);
      toast.success(t("onlineMeetings.details.copied"));
    }
  };

  const handleAddAttendees = async () => {
    if (!selectedUsers.length) return;
    
    try {
      await addAttendeeToOnlineCourse(meetingId, selectedUsers);
      setSelectedUsers([]);
      refetch();
      toast.success("Attendees added successfully");
    } catch (error) {
      toast.error("Failed to add attendees");
    }
  };

  const handleRemoveAttendee = async (userId: string) => {
    try {
      await removeAttendeeFromOnlineCourse(meetingId, [userId]);
      refetch();
      toast.success("Attendee removed successfully");
    } catch (error) {
      toast.error("Failed to remove attendee");
    }
  };

  const toggleUserSelection = (userId: string) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-1/3" />
        <Skeleton className="h-6 w-1/4" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton className="h-40" />
          <Skeleton className="h-40" />
        </div>
        <Skeleton className="h-60" />
      </div>
    );
  }

  if (error || !meeting) {
    return (
      <Card className="w-full">
        <CardContent className="py-10">
          <div className="text-center">
            <p className="text-destructive mb-4">Error loading meeting details</p>
            <div className="flex justify-center gap-4">
              <Button onClick={() => refetch()}>Retry</Button>
              <Button variant="outline" onClick={() => router.back()}>Go Back</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getStatusBadge = () => {
    switch (meeting.status) {
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

  const isPast = new Date(meeting.start_time) < new Date();

  return (
    <>
      <div className="mb-6">
        <Button 
          variant="ghost" 
          className="flex items-center gap-2 mb-6"
          onClick={() => router.push("/dashboard/online-meetings")}
        >
          <ArrowLeft className="h-4 w-4" />
          {t("common.back")}
        </Button>
        
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-3">
              <VideoIcon className="h-6 w-6 text-primary" />
              {meeting.title}
              <div className="ml-2">{getStatusBadge()}</div>
            </h2>
            <p className="text-muted-foreground mt-1">
              {t("onlineMeetings.details.createdBy")}: {meeting.instructor.first_name} {meeting.instructor.last_name}
            </p>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(true)}
              className="flex items-center gap-2"
            >
              <Trash2 className="h-4 w-4" />
              {t("onlineMeetings.details.deleteMeeting")}
            </Button>
            
            {meeting.meeting_link && !isPast && (
              <>
                <Button
                  variant="outline"
                  onClick={handleCopyLink}
                  className="flex items-center gap-2"
                >
                  <Copy className="h-4 w-4" />
                  {t("onlineMeetings.details.copy")}
                </Button>
                
                <Button
                  asChild
                  variant="default"
                  className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
                >
                  <a href={meeting.meeting_link} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4" />
                    {t("onlineMeetings.details.joinMeeting")}
                  </a>
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t("onlineMeetings.details.startTime")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-primary" />
              <p>{format(new Date(meeting.start_time), "PPP")}</p>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <Clock className="h-4 w-4 text-primary" />
              <p>{format(new Date(meeting.start_time), "p")}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t("onlineMeetings.details.duration")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">{meeting.duration_minutes} {t("onlineMeetings.duration.minutes")}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
              {t("onlineMeetings.details.attendees")}
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm" className="flex items-center gap-1">
                    <UserPlus className="h-3 w-3" />
                    {t("onlineMeetings.details.addAttendees")}
                  </Button>
                </SheetTrigger>
                <SheetContent>
                  <SheetHeader>
                    <SheetTitle>{t("onlineMeetings.details.addAttendees")}</SheetTitle>
                    <SheetDescription>
                      {t("onlineMeetings.attendees.searchPlaceholder")}
                    </SheetDescription>
                  </SheetHeader>
                  
                  <div className="py-4">
                    <Input
                      placeholder={t("onlineMeetings.attendees.searchPlaceholder")}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="mb-4"
                    />
                    
                    <div className="space-y-2 max-h-[400px] overflow-y-auto">
                      {filteredUsers.length > 0 ? (
                        filteredUsers.map((user) => (
                          <div 
                            key={user.id} 
                            className={`
                              flex items-center justify-between p-2 rounded-md 
                              ${selectedUsers.includes(user.id) ? 'bg-primary/10' : 'hover:bg-muted/50'}
                            `}
                            onClick={() => toggleUserSelection(user.id)}
                          >
                            <div className="flex items-center gap-2">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={user.avatar} alt={`${user.first_name} ${user.last_name}`} />
                                <AvatarFallback>
                                  {user.first_name?.[0]}{user.last_name?.[0]}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium text-sm">{user.first_name} {user.last_name}</p>
                                <p className="text-xs text-muted-foreground">{user.email}</p>
                              </div>
                            </div>
                            <Button 
                              variant={selectedUsers.includes(user.id) ? "default" : "outline"} 
                              size="sm"
                            >
                              {selectedUsers.includes(user.id) 
                                ? t("onlineMeetings.attendees.added") 
                                : t("onlineMeetings.attendees.add")}
                            </Button>
                          </div>
                        ))
                      ) : (
                        <p className="text-center py-4 text-muted-foreground">
                          {t("onlineMeetings.attendees.noResults")}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <SheetFooter>
                    <SheetClose asChild>
                      <Button
                        onClick={handleAddAttendees}
                        disabled={selectedUsers.length === 0}
                      >
                        {t("onlineMeetings.attendees.add")} 
                        {selectedUsers.length > 0 && ` (${selectedUsers.length})`}
                      </Button>
                    </SheetClose>
                  </SheetFooter>
                </SheetContent>
              </Sheet>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">{meeting.attendees?.length || 0}</p>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            {t("onlineMeetings.details.attendees")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {meeting.attendees && meeting.attendees.length > 0 ? (
            <div className="space-y-4">
              {meeting.attendees.map((attendee) => (
                <div key={attendee.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={attendee.avatar} alt={`${attendee.first_name} ${attendee.last_name}`} />
                      <AvatarFallback>
                        {attendee.first_name?.[0]}{attendee.last_name?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{attendee.first_name} {attendee.last_name}</p>
                      <p className="text-sm text-muted-foreground">{attendee.email}</p>
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={() => handleRemoveAttendee(attendee.id)}
                  >
                    <UserX className="h-4 w-4" />
                    <span className="sr-only">{t("onlineMeetings.attendees.remove")}</span>
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p>{t("onlineMeetings.details.noAttendees")}</p>
            </div>
          )}
        </CardContent>
      </Card>
      
      {meeting.description && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Description</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-line">{meeting.description}</p>
          </CardContent>
        </Card>
      )}

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
