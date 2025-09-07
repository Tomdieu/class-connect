import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const videoUrl = searchParams.get('url');

    if (!videoUrl) {
      return new NextResponse('Video URL is required', { status: 400 });
    }

    // Validate that it's a valid S3 URL (adjust this validation based on your needs)
    if (!videoUrl.includes('s3.us-east-005.backblazeb2.com') && !videoUrl.includes('class-connect')) {
      return new NextResponse('Invalid video URL', { status: 400 });
    }

    // Check if this is a range request
    const range = request.headers.get('range');
    
    // Fetch the video from the S3 URL with proper headers
    const fetchHeaders: Record<string, string> = {
      'User-Agent': 'Mozilla/5.0 (compatible; VideoProxy/1.0)',
      'Accept': 'video/*,*/*',
      'Accept-Encoding': 'identity', // Don't compress video content
      'Connection': 'keep-alive',
    };

    // Add range header if present (for video seeking)
    if (range) {
      fetchHeaders['Range'] = range;
    }

    const response = await fetch(videoUrl, {
      method: 'GET',
      headers: fetchHeaders,
    });

    if (!response.ok) {
      console.error('Failed to fetch video:', response.status, response.statusText);
      return new NextResponse(`Failed to fetch video: ${response.statusText}`, { 
        status: response.status 
      });
    }

    const contentType = response.headers.get('content-type') || 'video/mp4';
    const contentLength = response.headers.get('content-length');
    const acceptRanges = response.headers.get('accept-ranges');
    const contentRange = response.headers.get('content-range');
    
    // Stream the video content
    const videoStream = response.body;

    const responseHeaders: Record<string, string> = {
      'Content-Type': contentType,
      'Cache-Control': 'public, max-age=3600, s-maxage=3600', // Cache for 1 hour
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS, HEAD',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, Range',
      'Access-Control-Expose-Headers': 'Content-Length, Content-Range, Accept-Ranges',
    };

    // Add content length if available
    if (contentLength) {
      responseHeaders['Content-Length'] = contentLength;
    }

    // Add range-related headers for video seeking
    if (acceptRanges) {
      responseHeaders['Accept-Ranges'] = acceptRanges;
    }

    if (contentRange) {
      responseHeaders['Content-Range'] = contentRange;
    }

    return new NextResponse(videoStream, {
      status: response.status,
      headers: responseHeaders,
    });
  } catch (error) {
    console.error('Error proxying video:', error);
    return new NextResponse('Internal Server Error: Unable to fetch video', { 
      status: 500 
    });
  }
}

// Handle preflight requests for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS, HEAD',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, Range',
      'Access-Control-Expose-Headers': 'Content-Length, Content-Range, Accept-Ranges',
    },
  });
}

// Handle HEAD requests for video metadata
export async function HEAD(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const videoUrl = searchParams.get('url');

    if (!videoUrl) {
      return new NextResponse('Video URL is required', { status: 400 });
    }

    if (!videoUrl.includes('s3.us-east-005.backblazeb2.com') && !videoUrl.includes('class-connect')) {
      return new NextResponse('Invalid video URL', { status: 400 });
    }

    const response = await fetch(videoUrl, {
      method: 'HEAD',
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; VideoProxy/1.0)',
      },
    });

    if (!response.ok) {
      return new NextResponse('Failed to fetch video metadata', { status: response.status });
    }

    const contentType = response.headers.get('content-type') || 'video/mp4';
    const contentLength = response.headers.get('content-length');
    const acceptRanges = response.headers.get('accept-ranges');

    return new NextResponse(null, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Length': contentLength || '0',
        'Accept-Ranges': acceptRanges || 'bytes',
        'Cache-Control': 'public, max-age=3600',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS, HEAD',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, Range',
        'Access-Control-Expose-Headers': 'Content-Length, Content-Range, Accept-Ranges',
      },
    });
  } catch (error) {
    console.error('Error getting video metadata:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
