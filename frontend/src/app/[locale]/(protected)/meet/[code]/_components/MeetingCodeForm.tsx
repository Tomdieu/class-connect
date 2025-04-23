'use client';

import { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { KeyRound } from "lucide-react";

export default function MeetingCodeForm() {
  const [meetingCode, setMeetingCode] = useState('');

  // Create a direct handler that navigates without form submission
  const handleJoinMeeting = () => {
    const trimmedCode = meetingCode.trim();
    if (trimmedCode) {
      // Use direct navigation
      window.location.href = `/meet/${trimmedCode}`;
    }
  };

  return (
    <div className="space-y-3">
      <div>
        <label htmlFor="meetingCode" className="flex items-center gap-1 text-sm font-medium text-muted-foreground mb-2">
          <KeyRound className="w-4 h-4 text-primary" />
          Meeting Code
        </label>
        <div className="relative">
          <Input
            type="text"
            id="meetingCode"
            value={meetingCode}
            onChange={(e) => setMeetingCode(e.target.value)}
            placeholder="e.g. abcdef123"
            className="pr-10 bg-background"
            autoFocus
            autoComplete="off"
            maxLength={32}
          />
          {meetingCode && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-primary/80 bg-primary/10 px-2 py-0.5 rounded font-mono">
              {meetingCode.length}/10
            </span>
          )}
        </div>
      </div>
      
      <Button
        type="button" // Changed to button type to avoid form submission
        className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-primary to-indigo-600 hover:from-primary/90 hover:to-indigo-700 transition-all"
        onClick={handleJoinMeeting}
      >
        Join Meeting
        <svg
          className="w-5 h-5 ml-1"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
        </svg>
      </Button>
    </div>
  );
}