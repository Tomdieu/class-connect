import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    // Try to get IP from request headers first (from nginx/proxy)
    const forwarded = request.headers.get('x-forwarded-for');
    const realIp = request.headers.get('x-real-ip');
    const remoteAddr = request.headers.get('remote-addr');

    if (forwarded) {
      // x-forwarded-for can contain multiple IPs, get the first one
      const ip = forwarded.split(',')[0].trim();
      if (ip && ip !== '127.0.0.1' && ip !== '::1') {
        return NextResponse.json({ ip });
      }
    }

    if (realIp && realIp !== '127.0.0.1' && realIp !== '::1') {
      return NextResponse.json({ ip: realIp });
    }

    if (remoteAddr && remoteAddr !== '127.0.0.1' && remoteAddr !== '::1') {
      return NextResponse.json({ ip: remoteAddr });
    }

    // Fallback: try external services server-side
    const ipServices = [
      'https://ipapi.co/ip/',
      'https://ipinfo.io/ip',
      'https://icanhazip.com'
    ];

    for (const service of ipServices) {
      try {
        const response = await fetch(service, {
          method: 'GET',
          timeout: 5000, // 5 second timeout
        } as any);
        
        if (response.ok) {
          const ip = (await response.text()).trim();
          if (ip && ip !== '127.0.0.1' && ip !== '::1') {
            return NextResponse.json({ ip });
          }
        }
      } catch (error) {
        console.debug(`IP service ${service} failed:`, error);
        continue;
      }
    }

    // If all else fails, return unknown
    return NextResponse.json({ ip: 'unknown' });

  } catch (error) {
    console.error('Error getting IP:', error);
    return NextResponse.json({ ip: 'unknown' });
  }
}
