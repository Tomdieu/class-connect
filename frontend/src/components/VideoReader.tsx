"use client";

import React from "react";
import ReactPlayer from "react-player";

type VideoReaderProps = {
  videoUrl: string; // Publicly accessible Backblaze B2 video URL
};

const VideoReader: React.FC<VideoReaderProps> = ({ videoUrl }) => {
  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      <ReactPlayer
        url={videoUrl}
        controls
        width="100%"
        height="auto"
        playing={false}
        config={{
          file: {
            attributes: {
              controlsList: "nodownload", // Prevents downloads (not foolproof)
            },
          },
        }}
      />
    </div>
  );
};

export default VideoReader;
