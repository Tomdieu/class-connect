// This file sets the maximum body size for API routes
// Place this in your app directory structure to override default limits

import { NextRequest } from 'next/server';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '2gb',
    },
    responseLimit: false,
  },
  maxDuration: 900, // 15 minutes for large uploads
}

// Export a function to handle large uploads if needed
export function createLargeUploadConfig() {
  return {
    maxFileSize: 2 * 1024 * 1024 * 1024, // 2GB
    timeout: 900000, // 15 minutes
    allowedMimeTypes: [
      'video/mp4',
      'video/mpeg',
      'video/quicktime',
      'video/x-msvideo',
      'video/webm',
      'application/pdf',
    ],
  };
}
