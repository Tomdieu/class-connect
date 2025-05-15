"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { Badge } from "@/components/ui/badge";
import { useI18n } from "@/locales/client";
import { OnlineCourseStatus, OnlineCourseType } from "@/types";
import { Calendar, Edit, Eye, Loader2, Plus, Trash, Users, Video, VideoOff } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useMeetingStore } from "@/store/meeting-store";
import CreateOnlineCourseModal from "@/components/online-courses/CreateOnlineCourseModal";

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.2 } },
};

const sectionVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

const statusVariantMap: Record<OnlineCourseStatus, "default" | "destructive" | "outline" | "secondary"> = {
  SCHEDULED: "outline",
  ONGOING: "default",
  COMPLETED: "secondary",
  CANCELLED: "destructive",
};

function OnlineMeetingPages() {
  const t = useI18n();
  const { 
    meetings, 
    loading, 
    error, 
    fetchMeetings, 
    deleteMeeting,
    statusFilter,
    setStatusFilter,
    searchQuery, 
    setSearchQuery,
    createDialogOpen,
    setCreateDialogOpen
  } = useMeetingStore();
  
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
  const [meetingToDelete, setMeetingToDelete] = useState<number | null>(null);
  const [deleteLoading, setDeleteLoading] = useState<boolean>(false);

  // Filters
  const [activeTab, setActiveTab] = useState<string>("all");

  useEffect(() => {
    let params: any = {};
    if (statusFilter !== "ALL") {
      params.status = statusFilter;
    }
    fetchMeetings(params);
  }, [statusFilter, fetchMeetings]);

  const handleDeleteClick = (id: number) => {
    setMeetingToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!meetingToDelete) return;
    
    setDeleteLoading(true);
    try {
      const success = await deleteMeeting(meetingToDelete.toString());
      if (success) {
        toast.success("Online meeting successfully deleted");
      } else {
        toast.error("Failed to delete online meeting");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete online meeting");
    } finally {
      setDeleteLoading(false);
      setDeleteDialogOpen(false);
      setMeetingToDelete(null);
    }
  };

  // Filter meetings based on search query
  const filteredMeetings = meetings.filter(meeting => 
    meeting.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    meeting.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    meeting.instructor.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    meeting.instructor.last_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Get upcoming meetings (scheduled & not in the past)
  const upcomingMeetings = filteredMeetings.filter(
    meeting => meeting.status === "SCHEDULED" && new Date(meeting.start_time) > new Date()
  );
  
  // Get active meetings (ongoing)
  const activeMeetings = filteredMeetings.filter(meeting => meeting.status === "ONGOING");
  
  // Get past meetings (completed or cancelled)
  const pastMeetings = filteredMeetings.filter(
    meeting => ["COMPLETED", "CANCELLED"].includes(meeting.status) || 
               (meeting.status === "SCHEDULED" && new Date(meeting.start_time) < new Date())
  );

  const displayMeetings = activeTab === "all" ? filteredMeetings : 
                          activeTab === "upcoming" ? upcomingMeetings :
                          activeTab === "active" ? activeMeetings : pastMeetings;

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
          <Video className="h-12 w-12 text-primary" />
        </div>
      </div>

      <div className="space-y-3 max-w-lg">
        <h3 className="text-2xl font-bold text-gray-800">
          No online meetings found
        </h3>
        <p className="text-gray-600">
          Create your first online meeting to connect with students in real-time virtual sessions.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl">
        {[
          {
            icon: <Video className="h-6 w-6 text-primary" />,
            title: "Real-time Teaching",
            description: "Connect with students through live video sessions"
          },
          {
            icon: <Users className="h-6 w-6 text-primary" />,
            title: "Group Sessions",
            description: "Teach multiple students at once for better engagement"
          },
          {
            icon: <Calendar className="h-6 w-6 text-primary" />,
            title: "Scheduled Learning",
            description: "Plan your sessions ahead for better organization"
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
          onClick={() => setCreateDialogOpen(true)}
        >
          <Plus className="mr-2 h-5 w-5" />
          Create Your First Meeting
        </Button>
        <p className="text-sm text-gray-500">
          Set up your virtual classroom in minutes
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
            <Video className="h-7 w-7 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
              Online Meetings
            </h1>
            <p className="text-sm text-gray-600">Manage virtual classrooms and video conferencing sessions</p>
          </div>
        </div>

        <Button
          className="bg-primary hover:bg-primary/90 text-white flex items-center gap-2 shadow-md hover:shadow-lg transition-shadow rounded-lg px-6 py-6 relative z-10"
          size="lg"
          onClick={() => setCreateDialogOpen(true)}
        >
          <Plus size={20} />
          Create Meeting
        </Button>
      </motion.div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="space-y-6 max-w-[2400px] mx-auto"
      >
        {/* Filters and search */}
        <motion.div 
          variants={sectionVariants}
          className="flex flex-col md:flex-row justify-between gap-4 bg-white/80 p-4 rounded-lg shadow-sm border border-gray-100"
        >
          <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
            <div className="w-full md:w-64">
              <Select 
                value={statusFilter}
                onValueChange={(value) => setStatusFilter(value as OnlineCourseStatus | "ALL")}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Status</SelectLabel>
                    <SelectItem value="ALL">All Statuses</SelectItem>
                    <SelectItem value="SCHEDULED">Scheduled</SelectItem>
                    <SelectItem value="ONGOING">Ongoing</SelectItem>
                    <SelectItem value="COMPLETED">Completed</SelectItem>
                    <SelectItem value="CANCELLED">Cancelled</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            
            <div className="w-full md:w-80">
              <Input 
                placeholder="Search meetings..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">Total: {filteredMeetings.length}</span>
          </div>
        </motion.div>

        <Tabs defaultValue="all" onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-4 w-full max-w-md mb-4">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
            <TabsTrigger value="past">Past</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all">
            <motion.div
              variants={sectionVariants}
              className="bg-white/90 backdrop-blur-sm rounded-xl px-4 py-6 shadow-md hover:shadow-lg transition-shadow duration-300 border border-primary/10 relative overflow-hidden"
            >
              {renderMeetingsTable()}
            </motion.div>
          </TabsContent>
          
          <TabsContent value="active">
            <motion.div
              variants={sectionVariants}
              className="bg-white/90 backdrop-blur-sm rounded-xl px-4 py-6 shadow-md hover:shadow-lg transition-shadow duration-300 border border-primary/10 relative overflow-hidden"
            >
              {renderMeetingsTable()}
            </motion.div>
          </TabsContent>
          
          <TabsContent value="upcoming">
            <motion.div
              variants={sectionVariants}
              className="bg-white/90 backdrop-blur-sm rounded-xl px-4 py-6 shadow-md hover:shadow-lg transition-shadow duration-300 border border-primary/10 relative overflow-hidden"
            >
              {renderMeetingsTable()}
            </motion.div>
          </TabsContent>
          
          <TabsContent value="past">
            <motion.div
              variants={sectionVariants}
              className="bg-white/90 backdrop-blur-sm rounded-xl px-4 py-6 shadow-md hover:shadow-lg transition-shadow duration-300 border border-primary/10 relative overflow-hidden"
            >
              {renderMeetingsTable()}
            </motion.div>
          </TabsContent>
        </Tabs>
      </motion.div>

      {/* Create Meeting Modal */}
      <CreateOnlineCourseModal 
        isOpen={createDialogOpen} 
        onClose={() => setCreateDialogOpen(false)} 
        onSuccess={() => {
          toast.success("Meeting created successfully!");
          fetchMeetings();
          setCreateDialogOpen(false); // Explicitly close the modal after success
        }}
        onError={() => toast.error("Failed to create meeting. Please try again.")}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Online Meeting</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this meeting? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteLoading}>
              Cancel
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
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  );

  function renderMeetingsTable() {
    if (loading) {
      return (
        <div className="flex justify-center items-center h-40">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2 text-lg">Loading meetings...</span>
        </div>
      );
    }
    
    if (error) {
      return (
        <div className="flex flex-col justify-center items-center h-40 space-y-4">
          <p className="text-destructive">{error}</p>
          <Button onClick={() => fetchMeetings()}>Retry</Button>
        </div>
      );
    }
    
    if (!displayMeetings.length) {
      return renderEmptyState();
    }
    
    return (
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Instructor</TableHead>
              <TableHead>Date & Time</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Attendees</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <AnimatePresence>
              {displayMeetings.map((meeting) => (
                <TableRow key={meeting.id} className="group">
                  <TableCell className="font-medium">
                    <div className="flex items-center">
                      <div className={`w-2 h-2 rounded-full mr-2 ${meeting.status === 'ONGOING' ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}`}></div>
                      {meeting.title}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                        {meeting.instructor.first_name[0]}
                        {meeting.instructor.last_name[0]}
                      </div>
                      <span>
                        {meeting.instructor.first_name} {meeting.instructor.last_name}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {format(new Date(meeting.start_time), 'MMM d, yyyy • h:mm a')}
                  </TableCell>
                  <TableCell>{meeting.duration_minutes} mins</TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <Badge variant="outline" className="bg-primary/5">
                        {meeting.attendees.length} attendees
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusVariantMap[meeting.status] || "outline"}>
                      {meeting.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    {meeting.meeting_link && (
                      <Button variant="outline" size="sm" asChild className="bg-green-50 hover:bg-green-100 text-green-700 border-green-200">
                        <a href={meeting.meeting_link} target="_blank" rel="noopener noreferrer">
                          <Video className="h-4 w-4 mr-1" />
                          Join
                        </a>
                      </Button>
                    )}
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/admin/online-meetings/${meeting.id}`}>
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Link>
                    </Button>
                    {meeting.status !== "COMPLETED" && meeting.status !== "CANCELLED" && (
                      <>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleDeleteClick(meeting.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash className="h-4 w-4 mr-1" />
                          Delete
                        </Button>
                      </>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </AnimatePresence>
          </TableBody>
        </Table>
      </div>
    );
  }
}

export default OnlineMeetingPages;