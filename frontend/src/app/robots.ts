import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/admin/',  // Blocks all admin routes
        '/dashboard/',  // Blocks all dashboard routes
      ],
    },
    sitemap: 'https://www.classconnect.cm/sitemap.xml',
  }
}