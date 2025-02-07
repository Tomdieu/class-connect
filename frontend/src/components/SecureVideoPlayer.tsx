"use client";
import React, { useEffect, useRef, useState } from 'react';
import { Loader2, Maximize, Minimize, Pause, Play, Volume2, VolumeX } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SecureVideoPlayerProps {
    src: string;
    title?: string;
    className?: string;
    autoPlay?: boolean;
    startAt?: number; // Start time in seconds
    initialProgress?: number; // Initial progress percentage
    onProgressChange?: (progress: number) => void; // Callback for progress updates
    onTimeUpdate?: (currentTime: number, duration: number) => void; // Callback for time updates
    onPlay?: () => void;
    onPause?: () => void;
    onEnd?: () => void;
}

export const SecureVideoPlayer: React.FC<SecureVideoPlayerProps> = ({
                                                                        src,
                                                                        title,
                                                                        className,
                                                                        autoPlay = true,
                                                                        startAt = 0,
                                                                        initialProgress,
                                                                        onProgressChange,
                                                                        onTimeUpdate,
                                                                        onPlay,
                                                                        onPause,
                                                                        onEnd,
                                                                    }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const progressUpdateInterval = useRef<NodeJS.Timeout>();
    const [isPlaying, setIsPlaying] = useState(autoPlay);
    const [isMuted, setIsMuted] = useState(true);
    const [progress, setProgress] = useState(initialProgress || 0);
    const [duration, setDuration] = useState(0);
    const [currentTime, setCurrentTime] = useState(startAt);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isBuffering, setIsBuffering] = useState(false);
    const [showControls, setShowControls] = useState(true);
    const [bufferedProgress, setBufferedProgress] = useState(0);
    const [showInitialLoader, setShowInitialLoader] = useState(true);
    let controlsTimeout: NodeJS.Timeout;

    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        // Reset states
        setIsLoading(true);
        setShowInitialLoader(true);
        setProgress(initialProgress || 0);
        setBufferedProgress(0);
        setCurrentTime(startAt);
        setDuration(0);

        // Set initial time
        video.currentTime = startAt;

        const handleLoadedMetadata = () => {
            setDuration(video.duration);
            setIsLoading(false);
        };

        const handleCanPlay = () => {
            setShowInitialLoader(false);
            if (autoPlay) {
                video.play().catch(() => {
                    setIsPlaying(false);
                });
            }
        };

        const handleTimeUpdate = () => {
            const newTime = video.currentTime;
            const newProgress = (newTime / video.duration) * 100;

            setCurrentTime(newTime);
            setProgress(newProgress);

            onTimeUpdate?.(newTime, video.duration);
            onProgressChange?.(newProgress);
        };

        const handleProgress = () => {
            if (video.buffered.length > 0) {
                const buffered = video.buffered.end(video.buffered.length - 1);
                setBufferedProgress((buffered / video.duration) * 100);
            }
        };

        const handlePlay = () => {
            setIsPlaying(true);
            onPlay?.();
        };

        const handlePause = () => {
            setIsPlaying(false);
            onPause?.();
        };

        const handleEnded = () => {
            setIsPlaying(false);
            onEnd?.();
        };

        const handleWaiting = () => setIsBuffering(true);
        const handlePlaying = () => setIsBuffering(false);
        const handleSeeking = () => setIsBuffering(true);
        const handleSeeked = () => setIsBuffering(false);

        // Add all event listeners
        video.addEventListener('loadedmetadata', handleLoadedMetadata);
        video.addEventListener('canplay', handleCanPlay);
        video.addEventListener('timeupdate', handleTimeUpdate);
        video.addEventListener('progress', handleProgress);
        video.addEventListener('play', handlePlay);
        video.addEventListener('pause', handlePause);
        video.addEventListener('ended', handleEnded);
        video.addEventListener('waiting', handleWaiting);
        video.addEventListener('playing', handlePlaying);
        video.addEventListener('seeking', handleSeeking);
        video.addEventListener('seeked', handleSeeked);

        // Start progress update interval
        progressUpdateInterval.current = setInterval(() => {
            if (video.paused) return;
            const newTime = video.currentTime;
            onTimeUpdate?.(newTime, video.duration);
        }, 10000); // Update every 10 second

        // Cleanup function
        return () => {
            video.removeEventListener('loadedmetadata', handleLoadedMetadata);
            video.removeEventListener('canplay', handleCanPlay);
            video.removeEventListener('timeupdate', handleTimeUpdate);
            video.removeEventListener('progress', handleProgress);
            video.removeEventListener('play', handlePlay);
            video.removeEventListener('pause', handlePause);
            video.removeEventListener('ended', handleEnded);
            video.removeEventListener('waiting', handleWaiting);
            video.removeEventListener('playing', handlePlaying);
            video.removeEventListener('seeking', handleSeeking);
            video.removeEventListener('seeked', handleSeeked);

            if (progressUpdateInterval.current) {
                clearInterval(progressUpdateInterval.current);
            }
        };
    }, [src, autoPlay, startAt, initialProgress, onProgressChange, onTimeUpdate, onPlay, onPause, onEnd]);

    const togglePlay = () => {
        if (videoRef.current) {
            if (isPlaying) {
                videoRef.current.pause();
            } else {
                videoRef.current.play();
            }
        }
    };

    const toggleMute = () => {
        if (videoRef.current) {
            videoRef.current.muted = !isMuted;
            setIsMuted(!isMuted);
        }
    };

    const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!videoRef.current) return;

        const bounds = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - bounds.left;
        const width = bounds.width;
        const percentage = (x / width) * 100;
        const time = (percentage / 100) * duration;

        videoRef.current.currentTime = time;
        setProgress(percentage);
    };

    const toggleFullscreen = () => {
        if (!containerRef.current) return;

        if (!document.fullscreenElement) {
            containerRef.current.requestFullscreen();
            setIsFullscreen(true);
        } else {
            document.exitFullscreen();
            setIsFullscreen(false);
        }
    };

    const formatTime = (timeInSeconds: number) => {
        const hours = Math.floor(timeInSeconds / 3600);
        const minutes = Math.floor((timeInSeconds % 3600) / 60);
        const seconds = Math.floor(timeInSeconds % 60);

        if (hours > 0) {
            return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        } else if (minutes > 0) {
            return `${minutes}:${seconds.toString().padStart(2, '0')}`;
        } else {
            return `0:${seconds.toString().padStart(2, '0')}`;
        }
    };

    const handleMouseMove = () => {
        setShowControls(true);
        clearTimeout(controlsTimeout);
        controlsTimeout = setTimeout(() => {
            if (isPlaying) {
                setShowControls(false);
            }
        }, 3000);
    };

    return (
        <div
            ref={containerRef}
            className={cn(
                "relative w-full aspect-video bg-black rounded-lg overflow-hidden group",
                className
            )}
            onMouseMove={handleMouseMove}
            onMouseLeave={() => isPlaying && setShowControls(false)}
        >
            {/* Initial loader with message */}
            {showInitialLoader && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 z-50">
                    <Loader2 className="w-12 h-12 text-white animate-spin mb-4" />
                    <p className="text-white text-sm">Loading video...</p>
                </div>
            )}

            <video
                ref={videoRef}
                className="w-full h-full"
                autoPlay={autoPlay}
                playsInline
                preload="auto"
                muted={isMuted}
                onContextMenu={(e) => e.preventDefault()}
                controlsList="nodownload"
            >
                <source src={src} type="video/mp4" />
                Your browser does not support the video tag.
            </video>

            {/* Buffering indicator */}
            {(!showInitialLoader && isBuffering) && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                    <Loader2 className="w-8 h-8 text-white animate-spin" />
                </div>
            )}

            <div
                className={cn(
                    "absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 transition-opacity duration-300",
                    showControls ? "opacity-100" : "opacity-0"
                )}
            >
                {/* Progress bar with buffer indicator */}
                <div
                    className="relative w-full h-1 bg-white/30 rounded cursor-pointer mb-4 overflow-hidden"
                    onClick={handleProgressClick}
                >
                    {/* Buffer progress */}
                    <div
                        className="absolute h-full bg-white/40 rounded"
                        style={{ width: `${bufferedProgress}%` }}
                    />
                    {/* Playback progress */}
                    <div
                        className="absolute h-full bg-primary rounded"
                        style={{ width: `${progress}%` }}
                    />
                </div>

                {/* Controls */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={togglePlay}
                            className="text-white hover:text-primary transition-colors"
                        >
                            {isPlaying ? (
                                <Pause className="w-6 h-6" />
                            ) : (
                                <Play className="w-6 h-6" />
                            )}
                        </button>

                        <button
                            onClick={toggleMute}
                            className="text-white hover:text-primary transition-colors"
                        >
                            {isMuted ? (
                                <VolumeX className="w-6 h-6" />
                            ) : (
                                <Volume2 className="w-6 h-6" />
                            )}
                        </button>

                        <span className="text-white text-sm">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
                    </div>

                    <div className="flex items-center gap-4">
                        {title && (
                            <span className="text-white text-sm hidden sm:block">
                {title}
              </span>
                        )}

                        <button
                            onClick={toggleFullscreen}
                            className="text-white hover:text-primary transition-colors"
                        >
                            {isFullscreen ? (
                                <Minimize className="w-6 h-6" />
                            ) : (
                                <Maximize className="w-6 h-6" />
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};