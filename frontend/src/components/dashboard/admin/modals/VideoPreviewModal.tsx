"use client";
import React from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {useSelectVideoStore} from "@/hooks/select-video-store";
import {SecureVideoPlayer} from "@/components/SecureVideoPlayer";
import ReactPlayer from 'react-player'

export const VideoPreviewModal = () => {
    const { video, isOpen, onClose } = useSelectVideoStore();
    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent showIcon={false} className="sm:max-w-[900px] p-0">
                <DialogHeader className="p-6 pb-0 flex flex-row items-center justify-between">
                    <DialogTitle>Video Player</DialogTitle>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 p-0"
                        onClick={onClose}

                    >
                        <X className="h-4 w-4" />
                    </Button>
                </DialogHeader>
                <div className="p-6 pt-2">
                    
                    {video && (
                        <div>
                            <SecureVideoPlayer
                                src={video.video_file}
                                className="rounded-sm overflow-hidden"
                                title={video.title}
                                autoPlay={true}
                                onTimeUpdate={console.log}
                                startAt={30}
                                // onProgressChange={console.log}

                            />
                            <div className={"flex flex-col gap-2"}>
                            <h5 className={"text-xl"}>{video.title}</h5>
                                {video.description && (
                            <p className={"text-muted-foreground"}>{video.description}</p>

                                )}
                            </div>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
};