"use client";
import React, { useEffect, useState } from "react";
import { JitsiMeeting } from "@jitsi/react-sdk";
import { useSession } from "next-auth/react";
import { 
  getOnlineCourseParticipants, 
  createOnlineCourseParticipants,
  participantJoinOnlineCourse,
  participantLeaveOnlineCourse 
} from "@/actions/online-courses";
import { OnlineCourseParticipantType } from "@/types";

interface MeetingProps {
  roomName?: string;
  disableModeratorIndicator?: boolean;
}

function Meeting({
  roomName = "PleaseUseAGoodRoomName",
  disableModeratorIndicator = true,
}: MeetingProps) {
  const { data: session } = useSession();
  const [participants, setParticipants] = useState<OnlineCourseParticipantType[]>([]);
  const [currentParticipant, setCurrentParticipant] = useState<OnlineCourseParticipantType | null>(null);
  const [isJoined, setIsJoined] = useState(false);

  // Create a ref to store the latest participant ID
  const currentParticipantRef = React.useRef<OnlineCourseParticipantType | null>(null);

  // Update ref when currentParticipant changes
  useEffect(() => {
    currentParticipantRef.current = currentParticipant;
  }, [currentParticipant]);

  // Fetch initial participants
  useEffect(() => {
    const fetchParticipants = async () => {
      try {
        const fetchedParticipants = await getOnlineCourseParticipants(roomName);
        setParticipants(fetchedParticipants);
        
        // Find or create current user's participant entry
        const userParticipant = fetchedParticipants.find(
          p => p.user.id === session?.user?.id
        );
        
        if (!userParticipant && session?.user?.id) {
          const newParticipant = await createOnlineCourseParticipants(roomName);
          setCurrentParticipant(newParticipant);
          currentParticipantRef.current = newParticipant;
          
          // If already joined, trigger join API call
          if (isJoined && newParticipant?.id) {
            await participantJoinOnlineCourse(roomName, newParticipant.id);
          }
        } else {
          setCurrentParticipant(userParticipant || null);
          currentParticipantRef.current = userParticipant;
        }
      } catch (error) {
        console.error("Error fetching participants:", error);
      }
    };

    if (session?.user) {
      fetchParticipants();
    }
  }, [roomName, session?.user, isJoined]);

  return (
    <div className="meeting-container w-full h-full">
      <JitsiMeeting
        domain="meet.classconnect.cm" // Replace with your actual Jitsi domain
        roomName={roomName}
        configOverwrite={{
          startWithAudioMuted: true,
          disableModeratorIndicator,
          startScreenSharing: true,
          enableEmailInStats: false,
        }}
        interfaceConfigOverwrite={{
          DISABLE_JOIN_LEAVE_NOTIFICATIONS: true,
        }}
        userInfo={{
          displayName: session?.user?.first_name + " "+session?.user?.last_name || "Anonymous",
          email: session?.user?.email || "",
        }}
        onApiReady={(externalApi) => {
          // Handle conference join
          externalApi.on("videoConferenceJoined", async (conference) => {
            console.debug("JOINED:", conference);
            setIsJoined(true);
            
            // Use the ref to access the latest participant
            const participant = currentParticipantRef.current;
            if (participant?.id) {
              try {
                await participantJoinOnlineCourse(roomName, participant.id);
                console.log("Successfully marked participant as joined");
              } catch (error) {
                console.error("Error marking participant as joined:", error);
              }
            } else {
              console.log("No participant ID available yet");
            }
          });

          // Handle participant left
          externalApi.on("videoConferenceLeft", async () => {
            setIsJoined(false);
            const participant = currentParticipantRef.current;
            if (participant?.id) {
              try {
                await participantLeaveOnlineCourse(roomName, participant.id);
                console.log("Successfully marked participant as left");
              } catch (error) {
                console.error("Error marking participant as left:", error);
              }
            }
          });

          // Handle participant joined
          externalApi.on("participantJoined", async (participant) => {
            console.debug("Participant joined:", participant);
            if (currentParticipant?.id) {
              try {
                await participantJoinOnlineCourse(roomName, currentParticipant.id);
              } catch (error) {
                console.error("Error marking participant as joined:", error);
              }
            }
          });

          // Handle participant left
          externalApi.on("participantLeft", async (participant) => {
            console.debug("Participant left:", participant);
            if (currentParticipant?.id) {
              try {
                await participantLeaveOnlineCourse(roomName, currentParticipant.id);
              } catch (error) {
                console.error("Error marking participant as left:", error);
              }
            }
          });

          // 1. Execute commands:
          // externalApi.executeCommand('toggleAudio') - mute/unmute audio
          // externalApi.executeCommand('toggleVideo') - turn on/off camera
          // externalApi.executeCommand('toggleShareScreen') - start/stop screen sharing
          // externalApi.executeCommand('hangup') - leave the meeting
          // externalApi.executeCommand('setTileView', true) - enable tile view

          // 2. Add event listeners:
          externalApi.addListener("participantJoined", (participant) => {
            console.debug("JOINING : ", participant);
            // Handle participant joining
            // e.g., update UI or notify users
            console.log("JOINING : ", participant);
          });
          // externalApi.addListener('participantLeft', (participant) => {...})
          // externalApi.addListener('videoConferenceJoined', (conference) => {...})
          // externalApi.addListener('videoConferenceLeft', () => {...})
          // externalApi.addListener('audioMuteStatusChanged', (muted) => {...})
          // externalApi.addListener('videoMuteStatusChanged', (muted) => {...})
          // externalApi.addListener('screenSharingStatusChanged', (sharing) => {...})

          // 3. Query information:
          // externalApi.getParticipantsInfo() - get all participants info
          // externalApi.getVideoQuality() - get video quality settings
          // externalApi.isAudioMuted() - check if audio is muted
          // externalApi.isVideoMuted() - check if video is muted

          // 4. Dispose the meeting:
          // externalApi.dispose() - remove the conference and clean up
        }}
        getIFrameRef={(iframeRef) => {
          iframeRef.style.height = "100%";
          iframeRef.style.width = "100%";
        }}
      />
    </div>
  );
}

export default Meeting;
