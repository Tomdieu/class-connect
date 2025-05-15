"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { getOnlineCourseFromId, getOnlineCourseParticipants } from "@/actions/online-courses";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { ArrowLeft, Calendar, Clock, Copy, ExternalLink, Loader2, Users, Video } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useI18n } from "@/locales/client";

export default function MeetingDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const t = useI18n();
  
  const [meeting, setMeeting] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copyLinkText, setCopyLinkText] = useState("Copier le lien");

  useEffect(() => {
    async function fetchMeetingData() {
      try {
        setLoading(true);
        const meetingData = await getOnlineCourseFromId(id);
        setMeeting(meetingData);
        
        // Fetch participants
        const participantsData = await getOnlineCourseParticipants(id);
        setParticipants(participantsData);
      } catch (error) {
        console.error("Error fetching meeting data:", error);
        toast.error("Échec du chargement des détails de la réunion");
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      fetchMeetingData();
    }
  }, [id]);

  const copyMeetingLink = () => {
    if (meeting?.meeting_link) {
      navigator.clipboard.writeText(meeting.meeting_link);
      setCopyLinkText("Copié !");
      setTimeout(() => setCopyLinkText("Copier le lien"), 2000);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "SCHEDULED":
        return "bg-blue-100 text-blue-800";
      case "ONGOING":
        return "bg-green-100 text-green-800";
      case "COMPLETED":
        return "bg-gray-100 text-gray-800";
      case "CANCELLED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case "SCHEDULED":
        return "PLANIFIÉE";
      case "ONGOING":
        return "EN COURS";
      case "COMPLETED":
        return "TERMINÉE";
      case "CANCELLED":
        return "ANNULÉE";
      default:
        return status;
    }
  };

  // Format time in a reader-friendly format in French
  const formatMeetingTime = (startTime, durationMinutes) => {
    const start = new Date(startTime);
    const end = new Date(start.getTime() + durationMinutes * 60000);
    
    return `${format(start, 'd MMMM yyyy', { locale: fr })} • ${format(start, 'HH:mm', { locale: fr })} - ${format(end, 'HH:mm', { locale: fr })}`;
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-lg">Chargement des détails de la réunion...</p>
      </div>
    );
  }

  if (!meeting) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <div className="bg-red-50 p-4 rounded-full inline-flex">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold">Réunion introuvable</h1>
          <p className="text-gray-600">La réunion que vous cherchez n'existe pas ou vous n'y avez pas accès.</p>
          <Button asChild className="mt-6">
            <Link href="/admin/online-meetings">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour aux réunions
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 via-background to-background px-4 py-8">
      <div className="max-w-7xl mx-auto">
        {/* Header with back button */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mb-4 p-0 hover:bg-transparent"
          >
            <ArrowLeft className="mr-2 h-5 w-5" />
            <span>Retour aux réunions</span>
          </Button>
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold">{meeting.title}</h1>
              <div className="flex items-center gap-2 mt-2">
                <Badge className={getStatusColor(meeting.status)}>
                  {getStatusLabel(meeting.status)}
                </Badge>
                <span className="text-sm text-gray-500">
                  ID: {meeting.id}
                </span>
                {meeting.code && (
                  <span className="text-sm text-gray-500">
                    Code: {meeting.code}
                  </span>
                )}
              </div>
            </div>
            
            <div className="flex gap-2">
              {meeting.meeting_link && (
                <>
                  <Button
                    variant="outline"
                    className="flex items-center gap-2"
                    onClick={copyMeetingLink}
                  >
                    <Copy className="h-4 w-4" />
                    {copyLinkText}
                  </Button>
                  
                  <Button className="bg-primary text-white flex items-center gap-2" asChild>
                    <a href={meeting.meeting_link} target="_blank" rel="noopener noreferrer">
                      <Video className="h-4 w-4" />
                      Rejoindre la réunion externe
                    </a>
                  </Button>
                </>
              )}
              
              {meeting.code && (
                <Button className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2" asChild>
                  <Link href={`/meet/${meeting.code}`}>
                    <Video className="h-4 w-4" />
                    Rejoindre la réunion interne
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </div>
        
        {/* Main content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column - Meeting details */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Détails de la réunion</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Horaire</h3>
                      <div className="flex items-start mt-1 gap-2">
                        <Calendar className="h-5 w-5 text-primary mt-0.5" />
                        <div>
                          <p className="font-medium">
                            {formatMeetingTime(meeting.start_time, meeting.duration_minutes)}
                          </p>
                          <p className="text-sm text-gray-500">
                            {meeting.duration_minutes} minutes
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Créé par</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                          {meeting.instructor.first_name[0]}
                          {meeting.instructor.last_name[0]}
                        </div>
                        <div>
                          <p className="font-medium">
                            {meeting.instructor.first_name} {meeting.instructor.last_name}
                          </p>
                          <p className="text-sm text-gray-500">
                            {meeting.instructor.email}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Participants</h3>
                      <div className="flex items-start mt-1 gap-2">
                        <Users className="h-5 w-5 text-primary mt-0.5" />
                        <p className="font-medium">
                          {meeting.attendees?.length || 0} participants inscrits
                        </p>
                      </div>
                    </div>
                    
                    {meeting.meeting_link && (
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Lien de réunion</h3>
                        <div className="flex items-start mt-1 gap-2">
                          <ExternalLink className="h-5 w-5 text-primary mt-0.5" />
                          <a 
                            href={meeting.meeting_link} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="text-primary hover:underline break-all"
                          >
                            {meeting.meeting_link}
                          </a>
                        </div>
                      </div>
                    )}
                    
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Créé le</h3>
                      <div className="flex items-start mt-1 gap-2">
                        <Clock className="h-5 w-5 text-primary mt-0.5" />
                        <p className="font-medium">
                          {meeting.created_at ? format(new Date(meeting.created_at), 'd MMMM yyyy à HH:mm', { locale: fr }) : 'N/A'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Description</h3>
                  <div className="p-4 bg-gray-50 rounded-md">
                    <p className="whitespace-pre-line">{meeting.description || 'Aucune description fournie.'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Participants ({participants.length})</CardTitle>
                <CardDescription>Personnes inscrites à cette réunion</CardDescription>
              </CardHeader>
              <CardContent>
                {participants.length === 0 ? (
                  <div className="text-center py-6">
                    <Users className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">Aucun participant ne s'est encore inscrit à cette réunion.</p>
                  </div>
                ) : (
                  <div className="divide-y">
                    {participants.map((participant) => (
                      <div key={participant.id} className="py-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                            {participant.user.first_name[0]}
                            {participant.user.last_name[0]}
                          </div>
                          <div>
                            <p className="font-medium">
                              {participant.user.first_name} {participant.user.last_name}
                            </p>
                            <p className="text-sm text-gray-500">
                              {participant.user.email}
                            </p>
                          </div>
                        </div>
                        <div>
                          <Badge variant={participant.joined_at ? 'default' : 'outline'} className="ml-2">
                            {participant.joined_at ? 'A rejoint' : 'Pas encore rejoint'}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          
          {/* Right column - Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Statut de la réunion</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Statut</span>
                    <Badge className={getStatusColor(meeting.status)}>
                      {getStatusLabel(meeting.status)}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Heure de début</span>
                    <span className="font-medium">
                      {format(new Date(meeting.start_time), 'HH:mm', { locale: fr })}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Durée</span>
                    <span className="font-medium">{meeting.duration_minutes} minutes</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Participants</span>
                    <span className="font-medium">{participants.length}</span>
                  </div>
                  
                  <Separator />
                  
                  <div className="flex flex-col gap-3">
                    {meeting.meeting_link && (
                      <Button className="w-full bg-primary text-white" asChild>
                        <a href={meeting.meeting_link} target="_blank" rel="noopener noreferrer">
                          <Video className="mr-2 h-4 w-4" />
                          Rejoindre la réunion externe
                        </a>
                      </Button>
                    )}
                    
                    {meeting.code && (
                      <Button className="w-full bg-green-600 hover:bg-green-700 text-white" asChild>
                        <Link href={`/meet/${meeting.code}`}>
                          <Video className="mr-2 h-4 w-4" />
                          Rejoindre la réunion interne
                        </Link>
                      </Button>
                    )}
                    
                    <Button variant="outline" className="w-full" asChild>
                      <Link href="/admin/online-meetings">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Retour aux réunions
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Actions rapides</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {meeting.meeting_link && (
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={copyMeetingLink}
                  >
                    <Copy className="mr-2 h-4 w-4" />
                    {copyLinkText}
                  </Button>
                )}
                
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link href={`/admin/online-meetings`}>
                    <Users className="mr-2 h-4 w-4" />
                    Gérer toutes les réunions
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}