"use client";
import React, { useRef, useEffect, useState } from "react";
import { cn } from "@/lib/utils";

type VideoReaderProps = {
  videoUrl: string;
  className?: string;
  resourceId?: number;
  onProgressUpdate?: (currentTime: number, duration: number, progressPercentage: number) => void;
  initialTime?: number;
};

const VideoReader: React.FC<VideoReaderProps> = ({ 
  videoUrl, 
  className,
  resourceId,
  onProgressUpdate,
  initialTime = 0
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [progressPercentage, setProgressPercentage] = useState(0);
  
  // Set initial time when component mounts
  useEffect(() => {
    if (videoRef.current && initialTime > 0) {
      videoRef.current.currentTime = initialTime;
    }
  }, [initialTime]);
  
  // Track video progress
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    
    const handleTimeUpdate = () => {
      const current = video.currentTime;
      const total = video.duration;
      const progress = (current / total) * 100;
      
      setCurrentTime(current);
      setDuration(total);
      setProgressPercentage(progress);
      
      // Call the progress update callback if provided
      if (onProgressUpdate && !isNaN(total)) {
        // Only update at 5-second intervals to avoid excessive API calls
        if (Math.floor(current) % 5 === 0) {
          onProgressUpdate(current, total, progress);
        }
      }
    };
    
    const handleLoadedMetadata = () => {
      setDuration(video.duration);
    };
    
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleEnded = () => {
      setIsPlaying(false);
      // Ensure we mark as 100% complete when the video ends
      if (onProgressUpdate) {
        onProgressUpdate(video.duration, video.duration, 100);
      }
    };
    
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('ended', handleEnded);
    
    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('ended', handleEnded);
    };
  }, [onProgressUpdate]);

  // Format time to MM:SS
  const formatTime = (time: number): string => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  return (
    <div className={cn("video-player-container w-full", className)}>
      <video
        ref={videoRef}
        className="w-full max-h-[80vh]"
        controls
        controlsList="nodownload"
        src={videoUrl}
        preload="metadata"
      >
        Your browser does not support the video tag.
      </video>
      
      {/* Optional custom progress indicator */}
      <div className="flex items-center gap-2 px-4 py-2 text-sm text-muted-foreground">
        <span>{formatTime(currentTime)}</span>
        <div className="w-full bg-gray-200 h-1 rounded-full">
          <div 
            className="bg-primary h-1 rounded-full transition-all duration-300"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
        <span>{formatTime(duration)}</span>
      </div>
    </div>
  );
};

export default VideoReader;
