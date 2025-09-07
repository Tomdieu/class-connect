import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const pdfUrl = searchParams.get('url');

    if (!pdfUrl) {
      return new NextResponse('PDF URL is required', { status: 400 });
    }

    // Validate that it's a valid S3 URL (adjust this validation based on your needs)
    if (!pdfUrl.includes('s3.us-east-005.backblazeb2.com') && !pdfUrl.includes('class-connect')) {
      return new NextResponse('Invalid PDF URL', { status: 400 });
    }

    // Fetch the PDF from the S3 URL with proper headers
    const response = await fetch(pdfUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; PDFProxy/1.0)',
        'Accept': 'application/pdf,*/*',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
      },
      cache: 'force-cache', // Cache the response for better performance
    });

    if (!response.ok) {
      console.error('Failed to fetch PDF:', response.status, response.statusText);
      return new NextResponse(`Failed to fetch PDF: ${response.statusText}`, { 
        status: response.status 
      });
    }

    const contentType = response.headers.get('content-type');
    const contentLength = response.headers.get('content-length');
    
    // Ensure we're getting a PDF
    if (contentType && !contentType.includes('application/pdf')) {
      console.warn('Response is not a PDF:', contentType);
    }

    const pdfBuffer = await response.arrayBuffer();

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Length': contentLength || pdfBuffer.byteLength.toString(),
        'Cache-Control': 'public, max-age=3600, s-maxage=3600', // Cache for 1 hour
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Accept-Ranges': 'bytes', // Support range requests for large PDFs
      },
    });
  } catch (error) {
    console.error('Error proxying PDF:', error);
    return new NextResponse('Internal Server Error: Unable to fetch PDF', { 
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
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
