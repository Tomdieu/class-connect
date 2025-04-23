"use client"
import React from 'react'
import { JitsiMeeting } from '@jitsi/react-sdk'
import { useSession } from 'next-auth/react'

interface MeetingProps {
  roomName?: string;
  disableModeratorIndicator?: boolean;
}

function Meeting({ 
  roomName = "PleaseUseAGoodRoomName",
  disableModeratorIndicator = true 
}: MeetingProps) {
  const { data: session } = useSession()
  
  return (
    <div className="meeting-container w-full h-full">
      <JitsiMeeting
        domain="meet.classconnect.cm" // Replace with your actual Jitsi domain
        roomName={roomName}
        configOverwrite={{
          startWithAudioMuted: true,
          disableModeratorIndicator,
          startScreenSharing: true,
          enableEmailInStats: false
        }}
        interfaceConfigOverwrite={{
          DISABLE_JOIN_LEAVE_NOTIFICATIONS: true
        }}
        userInfo={{
          displayName: session?.user?.first_name || 'Anonymous',
          email: session?.user?.email || ''
        }}
        onApiReady={(externalApi) => {
          // externalApi gives you access to:
          
          // 1. Execute commands:
          // externalApi.executeCommand('toggleAudio') - mute/unmute audio
          // externalApi.executeCommand('toggleVideo') - turn on/off camera
          // externalApi.executeCommand('toggleShareScreen') - start/stop screen sharing
          // externalApi.executeCommand('hangup') - leave the meeting
          // externalApi.executeCommand('setTileView', true) - enable tile view
          
          // 2. Add event listeners:
          // externalApi.addListener('participantJoined', (participant) => {...})
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
          iframeRef.style.height = '100%'; 
          iframeRef.style.width = '100%';
        }}
      />
    </div>
  )
}

export default Meeting